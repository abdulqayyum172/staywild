# StayNest Real Estate Portal

StayNest is a premium real estate portal designed for listing, buying, and renting luxury properties in Nigeria. It features a fully integrated Admin Portal to manage listings, view inquiries, track user registrations, and handle secure client transactions via Paystack.

---

## Architecture Overview

StayNest is built using a modern decoupled architecture:
1. **Frontend (Vite + React + Vanilla CSS)**: A highly interactive, responsive SPA.
2. **Backend (Node.js + Express + REST API)**: Manages authentication (JWT), verification codes (Gmail SMTP / Brevo), and listings.
3. **Database (JSON File Storage)**: Uses flat JSON files located in the `server/` directory for zero-dependency portability.

---

## Modern Dynamic Listings & Routing

* **Dynamic Listings**: The **Buy** and **Rent** listings pages dynamically fetch active properties from the backend API, allowing admin-created properties to populate instantly on the live site.
* **Dynamic Property Details**: Redundant static detail pages (`BuyDetails1` to `BuyDetails9` and `RentDetails1` to `RentDetails9`) have been unified into dynamic, data-driven route templates:
  - `/buy/:id` rendered by `BuyDetails.jsx`
  - `/rent/:id` rendered by `RentDetails.jsx`
* **Seamless Payments**: Secure, live Paystack checkouts are dynamically configured using individual property pricing.

---

## Local Setup & Development

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).

### 2. Install Dependencies
Run the following in the root folder:
```bash
npm install
```

### 3. Environment Setup
Configure your environment variables by creating `.env` in the root folder. See the Configuration section below.

### 4. Run Locally (Dev Mode)
Run both frontend and backend concurrently:
```bash
npm run dev
```
* **Frontend**: Running on `http://localhost:5173`
* **Backend**: Running on `http://localhost:5000`

---

## Environment Variables Configuration

### Frontend Config
Create or edit your client-side environment configurations. In Vite, these must be prefixed with `VITE_` :
* `VITE_API_URL`: The full URL of the deployed backend API. For this project: `https://staywild-five.vercel.app/api`.

### Backend Config
Configure the Express server by setting these variables (e.g. in your hosting dashboard or local `.env`):
* `PORT`: Port for the API server (defaults to `5000`).
* `JWT_SECRET`: Secret key for signing Auth tokens (recommended to set a secure string in production).
* `CLIENT_ORIGIN`: Comma-separated list of allowed frontend URLs (e.g. `https://staynest.vercel.app,http://localhost:5173`).
* `GMAIL_USER`: The Gmail address used to send email verification codes (e.g. `yourname@gmail.com`).
* `GMAIL_APP_PASSWORD`: A 16-character Google App Password (not your primary password).
* `ADMIN_EMAIL`: Email address of the primary administrator (defaults to `admin8835@gmail.com`). Admin verification checks specifically target `abdulqayyumayinla1707@gmail.com` for system management tasks.

---

## Deployment Instructions

### Frontend (e.g., Vercel, Netlify)
Deploy the frontend from the root workspace or configure the build settings on Vercel:
* **Build Command**: `npm run build`
* **Output Directory**: `client/dist`
* **Environment Variables**: Add `VITE_API_URL` pointing to your deployed backend URL, including `/api`.
  - Example: `VITE_API_URL=https://staywild-five.vercel.app/api`
  - After changing this variable, redeploy the frontend because Vite reads it at build time.

### Backend (e.g., Render, Fly.io, VPS)
Deploy the backend Node server using:
* **Start Command**: `npm start`
* **Port**: `5000` (or let Render set it dynamically via `process.env.PORT`)
* **Environment Variables**: Make sure to set `CLIENT_ORIGIN`, `APP_URL`, `JWT_SECRET`, and Gmail/Brevo settings.
  - Example: `CLIENT_ORIGIN=https://staynest-172.vercel.app`
  - `CLIENT_ORIGIN` must be the frontend origin only, with no path at the end.
  - The backend also accepts `FRONTEND_URL` as an alias for CORS if your host uses that name.

### Connect Separate Deployments
When the frontend and backend are deployed to different domains, both sides must know about each other:

1. In the frontend hosting dashboard, set `VITE_API_URL` to the backend API URL:
   ```bash
   VITE_API_URL=https://staywild-five.vercel.app/api
   ```
2. In the backend hosting dashboard, set the allowed frontend URL:
   ```bash
   CLIENT_ORIGIN=https://staynest-172.vercel.app
   APP_URL=https://staynest-172.vercel.app
   ```
3. Redeploy both services.
4. Open `https://staywild-five.vercel.app/api/health`. It should return JSON with `"status": "ok"`.
5. Open the frontend browser console. If you see a CORS error, the value in `CLIENT_ORIGIN` does not exactly match the frontend domain shown in the browser address bar.

#### ⚠️ CRITICAL: Persistent Disk Setup (Render/Fly.io)
Because StayNest uses local JSON files under the `server/` directory as its database, **you must mount a persistent disk/volume** on your hosting provider to prevent data loss whenever the server restarts or redeploys:
1. **Create a Disk**: In the Render dashboard, create and attach a persistent Disk to your web service.
2. **Mount Path**: Mount the disk to `/opt/render/project/src/server` (or the folder corresponding to your server directory).
3. This keeps `users.json`, `admin-listings.json`, `buy-inquiries.json`, and `rent-inquiries.json` safe and persisted.
