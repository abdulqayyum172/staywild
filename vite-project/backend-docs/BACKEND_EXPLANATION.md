# StayNest Backend Explanation

This document explains the backend code in `server/server.js`. The backend is a small Express API that stores data in JSON files under the `server/` folder.

## How To Run It

From the `vite-project` folder:

```bash
npm run server
```

To run both the backend and the Vite frontend:

```bash
npm run dev
```

The backend defaults to:

```txt
http://localhost:5000
```

## Main Dependencies

- `express`: Creates the HTTP API server.
- `cors`: Allows the frontend app to call the backend from `localhost:5173`.
- `jsonwebtoken`: Creates and verifies login tokens.
- `bcryptjs`: Hashes passwords and verification codes.
- `dotenv`: Loads environment variables from `.env`.
- `nodemailer`: Sends email through Gmail when configured.
- `crypto`: Generates secure IDs and 7-digit verification codes.
- Node `fs` and `path`: Read and write local JSON database files.

## Configuration

The `config` object controls runtime settings:

```js
const config = {
  port: Number(process.env.PORT) || 5000,
  appMode: process.env.APP_MODE || "professional-serious",
  jwtSecret: process.env.JWT_SECRET || "staynest_dev_secret_change_me",
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(","),
  gmailUser: process.env.GMAIL_USER || "ayinlove172@gmail.com",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
  brevoApiKey: process.env.BREVO_API_KEY || "",
  adminEmail: process.env.ADMIN_EMAIL || "admin8835@gmail.com",
  appUrl: process.env.APP_URL || "http://localhost:5173",
  codeExpiryMinutes: 15,
  maxVerifyAttempts: 5,
  maxSavedProperties: 100,
  saltRounds: 10,
};
```

Important values:

- `PORT`: Backend port.
- `APP_MODE`: Backend mode. Defaults to `professional-serious`.
- `JWT_SECRET`: Secret used to sign login tokens. This should be set in production.
- `CLIENT_ORIGIN`: Allowed frontend URL. Defaults to `http://localhost:5173`.
- `GMAIL_USER` and `GMAIL_APP_PASSWORD`: Used for Gmail email sending.
- `BREVO_API_KEY`: Alternative email provider.
- `ADMIN_EMAIL`: Receives contact form messages.
- `APP_URL`: Link used in welcome emails.

If no email provider is configured, the backend logs development emails to the terminal instead of sending real emails.

## Backend Mode

The backend includes a professional and serious mode:

```txt
APP_MODE=professional-serious
```

This mode controls formal backend communication details:

- automated email colors and layout
- formal wording for system-generated email copy
- the backend signature shown in emails
- the `X-StayNest-Mode` response header
- metadata returned by `/api/health` and `/api/mode`

If `APP_MODE` is missing or unknown, the server falls back to `professional-serious`.

## Local JSON Data Files

The `files` object defines the backend's local storage:

```txt
server/users.json
server/pending-verifications.json
server/saved-properties.json
server/buy-inquiries.json
server/rent-inquiries.json
server/last-verification-code.txt
```

What each file does:

- `users.json`: Registered users with hashed passwords.
- `pending-verifications.json`: Signup requests waiting for email-code verification.
- `saved-properties.json`: Properties saved by logged-in users.
- `buy-inquiries.json`: Buyer inquiry messages.
- `rent-inquiries.json`: Rental inquiry messages.
- `last-verification-code.txt`: In development mode, stores the most recent verification code.

The helper `readJsonFile(filePath, fallback)` creates missing JSON files automatically and returns fallback data if the file is empty or unreadable.

The helper `writeJsonFile(filePath, data)` writes to a temporary file first, then renames it. This is safer than directly overwriting the JSON file.

## Express Setup

The server uses these global middleware functions:

- `cors(...)`: Allows requests from configured frontend origins.
- `express.json({ limit: "1mb" })`: Parses JSON request bodies.
- Request logger: Logs every method and URL with a timestamp.

Example log:

```txt
2026-06-22T12:00:00.000Z GET /api/health
```

## Shared Helper Functions

Common data-cleaning helpers:

- `normalizeEmail(email)`: Trims and lowercases an email.
- `cleanText(value)`: Converts a value to a trimmed string.
- `isEmail(email)`: Checks basic email format.
- `isGmailAddress(email)`: Only allows Gmail or Googlemail addresses for signup.
- `isStrongEnoughPassword(password)`: Requires at least 6 characters.
- `escapeHtml(value)`: Escapes user text before putting it into email HTML.

Error and async helpers:

- `createHttpError(status, message)`: Creates an error with an HTTP status.
- `asyncRoute(handler)`: Wraps async route handlers so errors reach Express error middleware.

## Authentication

### Public User Shape

`toPublicUser(user)` removes the password hash before sending user data to the frontend.

### Finding Users

`findUserByEmail(users, email)` compares normalized email addresses so email matching is case-insensitive.

### JWT Tokens

`signAuthToken(user)` creates a token containing:

```js
{
  id: user.id,
  name: user.name,
  email: user.email
}
```

The token expires in 24 hours.

### Protected Routes

`requireAuth` protects routes that require a logged-in user.

It expects this header:

```txt
Authorization: Bearer <token>
```

If the token is missing, invalid, or expired, the route returns `401`.

## Email Sending

The backend supports three email modes:

1. Gmail through `nodemailer`, if `GMAIL_APP_PASSWORD` is configured.
2. Brevo API, if `BREVO_API_KEY` is configured.
3. Development logger, if neither provider is configured.

`sendEmail(...)` chooses the provider.

### Verification Email

`verificationEmailHtml({ name, code })` builds the email that contains the 7-digit signup code.

### Welcome Email

`welcomeEmailHtml({ name })` builds the welcome email after a user verifies their email and the account is created.

`sendWelcomeEmailInBackground(user)` sends the welcome email without blocking the API response.

## Signup And Login Flow

### `POST /api/auth/signup`

Validates:

- name is present
- email is present and valid
- email is Gmail or Googlemail
- password is at least 6 characters
- user does not already exist

Then it:

1. Hashes the password.
2. Generates a 7-digit verification code.
3. Hashes the verification code.
4. Saves a pending signup in `pending-verifications.json`.
5. Sends or logs the verification email.
6. Returns `202`.

Response:

```json
{
  "email": "user@gmail.com",
  "message": "Verification code sent. Please check your Gmail to complete signup."
}
```

The user is not created yet. The user is created only after code verification.

### `POST /api/auth/verify-email`

Request body:

```json
{
  "email": "user@gmail.com",
  "code": "1234567"
}
```

This route:

1. Finds the pending signup.
2. Checks whether the code expired.
3. Checks whether too many attempts were used.
4. Compares the submitted code with the hashed code.
5. Creates the real user in `users.json`.
6. Removes the pending signup.
7. Sends the welcome email in the background.
8. Returns the public user and JWT token.

### `POST /api/auth/resend-code`

Request body:

```json
{
  "email": "user@gmail.com"
}
```

This route generates a new code for an existing pending signup, resets attempts to `0`, updates the expiry time, and sends/logs the new code.

### `POST /api/auth/login`

Request body:

```json
{
  "email": "user@gmail.com",
  "password": "password123"
}
```

This route:

1. Finds the user by email.
2. Compares the plain password with the stored password hash.
3. Returns the public user and JWT token.

### `GET /api/auth/me`

Protected route.

Returns the current logged-in user based on the JWT token.

## User Creation

`createUser({ name, email, passwordHash })` builds the stored user object:

```js
{
  id: crypto.randomUUID(),
  name,
  email,
  password: passwordHash,
  emailVerified: true,
  verifiedAt,
  createdAt
}
```

Passwords are never stored as plain text.

## Default Seed User

`seedDefaultUser()` creates a default user if `users.json` is empty.

Default credentials:

```txt
email: john@example.com
password: password123
```

This is useful for development, but it should be removed or changed before production.

## Buy Property Data

`buyProperties` is an in-memory array of properties for sale.

Each buy property includes:

- `id`
- `title`
- `location`
- `price`
- `priceLabel`
- `type`
- `bedrooms`
- `bathrooms`
- `sizeSqm`
- `status`
- `image`
- `hero`
- `gallery`
- `description`
- `features`
- `agent`

The helper `findBuyProperty(propertyId)` finds one buy property by numeric ID.

The helper `getBuyPropertySummary(property)` returns the smaller version used on listing pages.

## Buy Property Routes

### `GET /api/buy/properties`

Returns paginated buy properties.

Supported query parameters:

- `search`
- `type`
- `location`
- `minPrice`
- `maxPrice`
- `page`
- `limit`
- `sort`

Supported sort values:

- `price_asc`
- `price_desc`
- default ID order

Example:

```txt
GET /api/buy/properties?search=duplex&sort=price_asc&page=1&limit=6
```

### `GET /api/buy/properties/:id`

Returns full details for one buy property.

### `GET /api/buy/filters`

Returns available property types, locations, and min/max prices for buy listings.

### `GET /api/buy/saved`

Protected route.

Returns buy properties saved by the logged-in user.

### `POST /api/buy/saved`

Protected route.

Request body:

```json
{
  "propertyId": 1
}
```

Saves a buy property for the logged-in user. Duplicate saves are ignored.

### `DELETE /api/buy/saved/:id`

Protected route.

Removes a saved buy property.

### `POST /api/buy/inquiries`

Protected route.

Request body:

```json
{
  "propertyId": 1,
  "phone": "08000000000",
  "message": "I am interested in this property."
}
```

This route:

1. Validates the property.
2. Validates the message.
3. Gets the current user.
4. Stores the inquiry in `buy-inquiries.json`.
5. Emails/logs the inquiry for the property agent.

## Rent Property Data

`rentProperties` is an in-memory array of rental listings.

It uses the same general shape as `buyProperties`, but prices represent yearly rent.

The helper `findRentProperty(propertyId)` finds one rental property by numeric ID.

The helper `getRentPropertySummary(property)` returns the smaller rental-listing object.

## Rent Property Routes

### `GET /api/rent/properties`

Returns paginated rental properties.

Supported query parameters:

- `search`
- `type`
- `location`
- `minPrice`
- `maxPrice`
- `page`
- `limit`
- `sort`

Supported sort values:

- `price_asc`
- `price_desc`
- default ID order

### `GET /api/rent/properties/:id`

Returns full details for one rental property.

### `GET /api/rent/filters`

Returns available rental types, locations, and min/max yearly rent.

### `GET /api/rent/saved`

Protected route.

Returns rental properties saved by the logged-in user.

### `POST /api/rent/saved`

Protected route.

Request body:

```json
{
  "propertyId": 1
}
```

Saves a rental property for the logged-in user. Duplicate saves are ignored.

### `DELETE /api/rent/saved/:id`

Protected route.

Removes a saved rental property.

### `POST /api/rent/inquiries`

Protected route.

Request body:

```json
{
  "propertyId": 1,
  "phone": "08000000000",
  "message": "I want to inspect this rental."
}
```

This route:

1. Validates the property.
2. Validates the message.
3. Gets the current user.
4. Stores the inquiry in `rent-inquiries.json`.
5. Emails/logs the inquiry for the property agent.

## Saved Properties

Saved properties are stored in `saved-properties.json`.

Each saved item looks like:

```js
{
  id: crypto.randomUUID(),
  userId: req.auth.id,
  listingType: "buy" || "rent",
  propertyId: property.id,
  createdAt: new Date().toISOString()
}
```

The backend keeps buy and rent saved lists separate through `listingType`.

The maximum saved properties per user per listing type is controlled by:

```js
config.maxSavedProperties
```

## Contact Route

### `POST /api/contact`

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "I need help finding a property."
}
```

This route:

1. Validates required fields.
2. Validates email format.
3. Sends/logs an email to the admin.
4. Sends/logs a confirmation email to the sender.

## Newsletter Route

### `POST /api/subscribe`

Request body:

```json
{
  "email": "subscriber@example.com"
}
```

This route validates the email and sends/logs a subscription confirmation.

## Health Check

### `GET /api/health`

Returns:

```json
{
  "status": "ok",
  "service": "staynest-api",
  "mode": {
    "id": "professional-serious",
    "label": "Professional and Serious",
    "responseTone": "formal"
  }
}
```

Use this to confirm the backend is running.

### `GET /api/mode`

Returns the active backend mode:

```json
{
  "mode": {
    "id": "professional-serious",
    "label": "Professional and Serious",
    "responseTone": "formal",
    "signature": "StayNest Client Services"
  }
}
```

## Error Handling

The 404 middleware catches unknown routes:

```txt
Route not found: METHOD /path
```

The final error middleware sends JSON errors:

```json
{
  "message": "Error message"
}
```

For server errors, the backend returns:

```json
{
  "message": "Internal server error"
}
```

Detailed server errors are logged to the terminal.

## Backend Request Flow

A normal protected request works like this:

1. Frontend sends request with `Authorization: Bearer <token>`.
2. `requireAuth` verifies the token.
3. Route handler reads request body or query params.
4. Route validates input.
5. Route reads or writes JSON files if needed.
6. Route returns JSON response.
7. If anything fails, error middleware returns a structured error response.

## Current Backend Limitations

- Data is stored in JSON files, not a real database.
- Property data is hardcoded in `server.js`.
- There is no admin API for creating or editing properties.
- There is no refresh-token system.
- Verification and welcome emails depend on environment configuration, otherwise they are logged for development.
- The default development JWT secret should not be used in production.

## Recommended Production Improvements

- Move users, saved properties, inquiries, and properties into a database.
- Move property arrays into separate modules or database seed files.
- Add rate limiting to auth and inquiry endpoints.
- Add stronger password rules.
- Add admin authentication and property-management routes.
- Use a production email provider with verified sender domain.
- Set `JWT_SECRET`, `CLIENT_ORIGIN`, and email credentials through secure environment variables.
