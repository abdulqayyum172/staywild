import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const settingsPath = path.join(__dirname, "settings.json");
let persistentSettings = {};
if (fs.existsSync(settingsPath)) {
  try {
    persistentSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch (err) {
    console.error("Error reading settings.json:", err);
  }
}

const normalizeOrigin = (value) => {
  const cleaned = String(value || "").trim().replace(/\/+$/, "");

  if (!cleaned) {
    return "";
  }

  const url = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;

  try {
    return new URL(url).origin;
  } catch {
    return cleaned;
  }
};

const parseOrigins = (...values) => [
  ...new Set(
    values
      .flatMap((value) => String(value || "").split(","))
      .map(normalizeOrigin)
      .filter(Boolean)
  ),
];

const config = {
  port: Number(process.env.PORT) || 5000,
  appMode: process.env.APP_MODE || "professional-serious",
  jwtSecret: process.env.JWT_SECRET || "staynest_dev_secret_change_me",
  clientOrigins: parseOrigins(
    process.env.CLIENT_ORIGIN,
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    process.env.VERCEL_URL,
    "https://staynest-172.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173"
  ),
  gmailUser: persistentSettings.gmailUser || process.env.GMAIL_USER || "ayinlove172@gmail.com",
  gmailAppPassword: persistentSettings.gmailAppPassword || process.env.GMAIL_APP_PASSWORD || "",
  brevoApiKey: persistentSettings.brevoApiKey || process.env.BREVO_API_KEY || "",
  brevoSenderEmail: persistentSettings.brevoSenderEmail || process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER || "ayinlove172@gmail.com",
  brevoSenderName: persistentSettings.brevoSenderName || process.env.BREVO_SENDER_NAME || "StayNest",
  preferredProvider: persistentSettings.preferredProvider || process.env.PREFERRED_PROVIDER || "auto",
  adminEmail: process.env.ADMIN_EMAIL || "abdulqayyumayinla1707@gmail.com",
  appUrl:
    normalizeOrigin(process.env.APP_URL || process.env.FRONTEND_URL || String(process.env.CLIENT_ORIGIN || "").split(",")[0]) ||
    "https://staynest-172.vercel.app",
  mongodbUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  mongodbDbName: process.env.MONGODB_DB || "staynest",
  codeExpiryMinutes: 15,
  maxVerifyAttempts: 5,
  maxSavedProperties: 100,
  saltRounds: 10,
};

const backendModes = {
  "professional-serious": {
    id: "professional-serious",
    label: "Professional and Serious",
    responseTone: "formal",
    brandColor: "#1f2937",
    accentColor: "#0f766e",
    panelBackground: "#f8fafc",
    borderColor: "#d1d5db",
    signature: "StayNest Client Services",
  },
};

const activeBackendMode = backendModes[config.appMode] || backendModes["professional-serious"];

const files = {
  users: path.join(__dirname, "users.json"),
  pendingVerifications: path.join(__dirname, "pending-verifications.json"),
  savedProperties: path.join(__dirname, "saved-properties.json"),
  adminListings: path.join(__dirname, "admin-listings.json"),
  buyInquiries: path.join(__dirname, "buy-inquiries.json"),
  rentInquiries: path.join(__dirname, "rent-inquiries.json"),
  lastVerificationCode: path.join(__dirname, "last-verification-code.txt"),
};

const dataFileKeys = new Map([
  [files.users, "users"],
  [files.pendingVerifications, "pendingVerifications"],
  [files.savedProperties, "savedProperties"],
  [files.adminListings, "adminListings"],
  [files.buyInquiries, "buyInquiries"],
  [files.rentInquiries, "rentInquiries"],
]);

const dataStore = {
  connected: false,
  client: null,
  collection: null,
  cache: new Map(),
  pendingWrite: Promise.resolve(),
};

if (config.jwtSecret === "staynest_dev_secret_change_me") {
  console.warn("JWT_SECRET is not set. Using a development fallback secret.");
}

if (!backendModes[config.appMode]) {
  console.warn(`Unknown APP_MODE "${config.appMode}". Falling back to ${activeBackendMode.id}.`);
}

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin);
      if (!origin || config.clientOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      console.warn(`Blocked CORS origin: ${origin}. Allowed origins: ${config.clientOrigins.join(", ")}`);
      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    exposedHeaders: ["X-StayNest-Mode"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.use((_req, res, next) => {
  res.set("X-StayNest-Mode", activeBackendMode.id);
  next();
});

app.use((req, _res, next) => {
  console.info(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const cleanText = (value) => String(value || "").trim();
const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(email));
const isGmailAddress = (email) => {
  const normalized = normalizeEmail(email);
  return normalized.endsWith("@gmail.com") || normalized.endsWith("@googlemail.com");
};
const isStrongEnoughPassword = (password) => String(password || "").length >= 6;

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const emailShellStyle = () =>
  `font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid ${activeBackendMode.borderColor}; border-radius: 6px; color: #111827;`;
const emailHeadingStyle = (align = "left") =>
  `color: ${activeBackendMode.brandColor}; text-align: ${align}; margin-top: 0;`;
const emailPanelStyle = () =>
  `background-color: ${activeBackendMode.panelBackground}; padding: 15px; border-radius: 4px; border-left: 4px solid ${activeBackendMode.accentColor};`;
const emailFooterStyle = (align = "left") =>
  `font-size: 12px; color: #4b5563; text-align: ${align};`;
const emailModeNotice = () =>
  `<p style="font-size: 12px; color: #6b7280;">Mode: ${activeBackendMode.label}. This message was generated by the StayNest backend.</p>`;

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const cloneData = (value) => JSON.parse(JSON.stringify(value));

const getDataFileKey = (filePath) => dataFileKeys.get(filePath) || path.basename(filePath, path.extname(filePath));

const readJsonFileFromDisk = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }

    const content = fs.readFileSync(filePath, "utf8").trim();
    return content ? JSON.parse(content) : fallback;
  } catch (error) {
    console.error(`Failed to read ${path.basename(filePath)}:`, error);
    return fallback;
  }
};

const writeJsonFileToDisk = (filePath, data) => {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
  fs.renameSync(tempPath, filePath);
};

const persistDocumentToMongo = (key, data) => {
  if (!dataStore.connected || !dataStore.collection) {
    return;
  }

  const payload = cloneData(data);
  dataStore.pendingWrite = dataStore.pendingWrite
    .then(() =>
      dataStore.collection.updateOne(
        { _id: key },
        { $set: { data: payload, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      )
    )
    .catch((error) => {
      console.error(`Failed to persist ${key} to MongoDB:`, error);
    });
};

const initializeDataStore = async () => {
  if (!config.mongodbUri) {
    console.warn("MONGODB_URI is not set. Using local JSON files for backend data.");
    return;
  }

  try {
    dataStore.client = new MongoClient(config.mongodbUri, { serverSelectionTimeoutMS: 10000 });
    await dataStore.client.connect();
    dataStore.collection = dataStore.client.db(config.mongodbDbName).collection("appData");
    dataStore.connected = true;

    await Promise.all(
      [...dataFileKeys.entries()].map(async ([filePath, key]) => {
        const localData = readJsonFileFromDisk(filePath, key === "adminListings" ? { buy: [], rent: [], deletedIds: [] } : []);
        const existingDocument = await dataStore.collection.findOne({ _id: key });
        const data = existingDocument?.data ?? localData;

        dataStore.cache.set(key, cloneData(data));

        if (!existingDocument) {
          await dataStore.collection.updateOne(
            { _id: key },
            { $set: { data: cloneData(data), updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
          );
        }
      })
    );

    console.log(`MongoDB connected. Database: ${config.mongodbDbName}, collection: appData`);
  } catch (error) {
    dataStore.connected = false;
    console.error("MongoDB connection failed. Falling back to local JSON files:", error.message || error);
  }
};

const readJsonFile = (filePath, fallback = []) => {
  const key = getDataFileKey(filePath);

  if (dataStore.cache.has(key)) {
    return cloneData(dataStore.cache.get(key));
  }

  const data = readJsonFileFromDisk(filePath, fallback);
  dataStore.cache.set(key, cloneData(data));
  return data;
};

const writeJsonFile = (filePath, data) => {
  const key = getDataFileKey(filePath);
  dataStore.cache.set(key, cloneData(data));
  writeJsonFileToDisk(filePath, data);
  persistDocumentToMongo(key, data);
};

const getUsers = () => readJsonFile(files.users, []);
const saveUsers = (users) => writeJsonFile(files.users, users);
const getPendingVerifications = () => readJsonFile(files.pendingVerifications, []);
const savePendingVerifications = (pending) => writeJsonFile(files.pendingVerifications, pending);
const getSavedProperties = () => readJsonFile(files.savedProperties, []);
const saveSavedProperties = (savedProperties) => writeJsonFile(files.savedProperties, savedProperties);
const getAdminListings = () => {
  const listings = readJsonFile(files.adminListings, { buy: [], rent: [], deletedIds: [] });
  return {
    buy: Array.isArray(listings.buy) ? listings.buy : [],
    rent: Array.isArray(listings.rent) ? listings.rent : [],
    deletedIds: Array.isArray(listings.deletedIds) ? listings.deletedIds : [],
  };
};
const saveAdminListings = (listings) => writeJsonFile(files.adminListings, listings);
const getBuyInquiries = () => readJsonFile(files.buyInquiries, []);
const saveBuyInquiries = (inquiries) => writeJsonFile(files.buyInquiries, inquiries);
const getRentInquiries = () => readJsonFile(files.rentInquiries, []);
const saveRentInquiries = (inquiries) => writeJsonFile(files.rentInquiries, inquiries);

const getUserRole = (user) => {
  return normalizeEmail(user.email) === "abdulqayyumayinla1707@gmail.com" ? "admin" : "client";
};

const toPublicUser = (user) => {
  const publicUser = { ...user, role: getUserRole(user) };
  delete publicUser.password;
  return publicUser;
};

const findUserByEmail = (users, email) => {
  const normalizedEmail = normalizeEmail(email);
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail);
};

const signAuthToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: getUserRole(user),
    },
    config.jwtSecret,
    { expiresIn: "24h" }
  );

const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(createHttpError(401, "Access denied. No token provided."));
    return;
  }

  try {
    req.auth = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    next(createHttpError(401, "Invalid or expired token"));
  }
};

const requireAdmin = (req, _res, next) => {
  if (normalizeEmail(req.auth?.email) !== "abdulqayyumayinla1707@gmail.com") {
    next(createHttpError(403, "Admin access is required. Only the designated administrator is permitted."));
    return;
  }

  next();
};

const createUser = ({ name, email, passwordHash, role = "client" }) => {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: cleanText(name),
    email: normalizeEmail(email),
    password: passwordHash,
    role,
    emailVerified: true,
    verifiedAt: now,
    createdAt: now,
  };
};

const createGmailTransporter = () => {
  if (!config.gmailUser || !config.gmailAppPassword) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword,
    },
  });
};

const sendEmailViaGmail = async ({ toEmail, subject, html }) => {
  const transporter = createGmailTransporter();

  if (!transporter) {
    throw new Error("Gmail is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.");
  }

  await transporter.sendMail({
    from: `"StayNest" <${config.gmailUser}>`,
    to: toEmail,
    subject,
    html,
  });
};

const sendEmailViaBrevo = async ({ toEmail, toName, subject, html }) => {
  if (!config.brevoApiKey) {
    throw new Error("Brevo is not configured. Set BREVO_API_KEY.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": config.brevoApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: config.brevoSenderName, email: config.brevoSenderEmail },
      to: [{ email: toEmail, name: toName || toEmail.split("@")[0] }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to send email via Brevo");
  }
};

const logDevelopmentEmail = ({ toEmail, toName, subject, html }) => {
  console.log("");
  console.log("==================================================");
  console.log("DEVELOPMENT EMAIL");
  console.log(`To: ${toEmail}${toName ? ` (${toName})` : ""}`);
  console.log(`Subject: ${subject}`);

  const codeMatch = html.match(/data-verification-code="(\d{7})"/);
  if (codeMatch) {
    console.log(`Verification code: ${codeMatch[1]}`);
    fs.writeFileSync(files.lastVerificationCode, codeMatch[1]);
  }

  console.log("==================================================");
  console.log("");
};

const sendEmail = async ({ toEmail, toName = "", subject, html }) => {
  const provider = config.preferredProvider === "auto"
    ? (config.gmailAppPassword ? "gmail" : (config.brevoApiKey ? "brevo" : "logger"))
    : config.preferredProvider;

  if (provider === "gmail" && config.gmailAppPassword) {
    await sendEmailViaGmail({ toEmail, subject, html });
    return;
  }

  if (provider === "brevo" && config.brevoApiKey) {
    await sendEmailViaBrevo({ toEmail, toName, subject, html });
    return;
  }

  logDevelopmentEmail({ toEmail, toName, subject, html });
};

const generateVerificationCode = () => crypto.randomInt(1_000_000, 10_000_000).toString();

const verificationEmailHtml = ({ name, code }) => `
  <div style="${emailShellStyle()}">
    <h2 style="${emailHeadingStyle("center")}">StayNest Account Verification</h2>
    <p>Hello <strong>${escapeHtml(name)}</strong>,</p>
    <p>Use the 7-digit code below to complete your account verification.</p>
    <div style="text-align: center; margin: 30px 0;">
      <span data-verification-code="${code}" style="display: inline-block; background-color: ${activeBackendMode.panelBackground}; color: ${activeBackendMode.accentColor}; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 28px; border-radius: 6px;">${code}</span>
    </div>
    <p style="color: #374151; font-size: 14px;">This code expires in ${config.codeExpiryMinutes} minutes. If you did not request this, no action is required.</p>
    <hr style="border: 0; border-top: 1px solid ${activeBackendMode.borderColor}; margin: 20px 0;" />
    ${emailModeNotice()}
    <p style="${emailFooterStyle("center")}">${activeBackendMode.signature}</p>
  </div>
`;

const welcomeEmailHtml = ({ name }) => `
  <div style="${emailShellStyle()}">
    <h2 style="${emailHeadingStyle("center")}">Welcome to StayNest</h2>
    <p>Hello <strong>${escapeHtml(name)}</strong>,</p>
    <p>Your StayNest account has been created successfully.</p>
    <p>You can now review rental listings and premium properties across Nigeria.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${escapeHtml(config.appUrl)}" style="background-color: ${activeBackendMode.accentColor}; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 4px;">Review Properties</a>
    </div>
    <hr style="border: 0; border-top: 1px solid ${activeBackendMode.borderColor}; margin: 20px 0;" />
    ${emailModeNotice()}
    <p style="${emailFooterStyle("center")}">This is an automated email from ${activeBackendMode.signature}. Please do not reply directly to this message.</p>
  </div>
`;

const sendWelcomeEmailInBackground = (user) => {
  sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: "Welcome to StayNest",
    html: welcomeEmailHtml(user),
  }).catch((error) => {
    console.error("Welcome email failed:", error.message || error);
  });
};

const validateSignupInput = ({ name, email, password }) => {
  if (!cleanText(name) || !cleanText(email) || !password) {
    throw createHttpError(400, "All fields are required");
  }

  if (!isEmail(email)) {
    throw createHttpError(400, "Please enter a valid email address");
  }

  if (!isGmailAddress(email)) {
    throw createHttpError(400, "Please use a Gmail address (@gmail.com) to sign up");
  }

  if (!isStrongEnoughPassword(password)) {
    throw createHttpError(400, "Password must be at least 6 characters long");
  }
};

const seedDefaultUser = () => {
  const users = getUsers();

  if (users.length > 0) {
    return;
  }

  const passwordHash = bcrypt.hashSync("password123", config.saltRounds);
  saveUsers([
    {
      id: crypto.randomUUID(),
      name: "John Doe",
      email: "john@example.com",
      password: passwordHash,
      role: "client",
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
  ]);
};

await initializeDataStore();
seedDefaultUser();

const buyProperties = [
  {
    id: 1,
    title: "Skyline Royal Duplex",
    location: "Banana Island, Lagos",
    price: 30000000,
    priceLabel: "NGN 30,000,000",
    type: "Luxury Duplex",
    bedrooms: 5,
    bathrooms: 6,
    sizeSqm: 620,
    status: "available",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A world-class duplex offering smart-home integration, private elevator access, a rooftop lounge, and waterfront views.",
    features: ["5 Bedrooms", "Private Elevator", "Smart Home Automation", "Infinity Pool", "Cinema Room", "24/7 Security"],
    agent: { name: "Ngozi Balogun", phone: "2349163113401", email: "ngozi@stayfinder.com" },
  },
  {
    id: 2,
    title: "Royal Palm Waterfront Duplex",
    location: "Victoria Island, Lagos",
    price: 27000000,
    priceLabel: "NGN 27,000,000",
    type: "Waterfront Duplex",
    bedrooms: 5,
    bathrooms: 6,
    sizeSqm: 580,
    status: "available",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A waterfront duplex with infinity pool, marble interiors, private cinema room, and panoramic Atlantic views.",
    features: ["5 Ensuite Bedrooms", "Infinity Swimming Pool", "Private Cinema Room", "Smart Home System", "Oceanfront Balcony"],
    agent: { name: "Ngozi Balogun", phone: "2349163113401", email: "ngozi@stayfinder.com" },
  },
  {
    id: 3,
    title: "Marble Crest Mansion",
    location: "Lekki Phase 1, Lagos",
    price: 35000000,
    priceLabel: "NGN 35,000,000",
    type: "Luxury Mansion",
    bedrooms: 6,
    bathrooms: 7,
    sizeSqm: 760,
    status: "available",
    image: "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A 6-bedroom mansion with Italian marble interiors, automated lighting, rooftop lounge, and dual living rooms.",
    features: ["6 Bedrooms", "2 Living Rooms", "Private Rooftop Lounge", "Smart Lighting", "Home Office", "24/7 Security"],
    agent: { name: "Femi Adesina", phone: "2349163113401", email: "femi@stayfinder.com" },
  },
  {
    id: 4,
    title: "Skyline Penthouse",
    location: "Victoria Island, Lagos",
    price: 8000000,
    priceLabel: "NGN 8,000,000",
    type: "Luxury Penthouse",
    bedrooms: 4,
    bathrooms: 5,
    sizeSqm: 410,
    status: "available",
    image: "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600585154542-630846df5648?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A 4-bedroom penthouse with panoramic city and ocean views, private elevator, and smart-home integration.",
    features: ["4 Ensuite Bedrooms", "Private Elevator", "Panoramic Views", "Jacuzzi Balcony", "Concierge Service"],
    agent: { name: "Tunde Bakare", phone: "2349163113401", email: "tunde@stayfinder.com" },
  },
  {
    id: 5,
    title: "Azure Coast Villa",
    location: "Epe Lagoon, Lagos",
    price: 20000000,
    priceLabel: "NGN 20,000,000",
    type: "Beachfront Villa",
    bedrooms: 5,
    bathrooms: 5,
    sizeSqm: 690,
    status: "available",
    image: "https://images.unsplash.com/photo-1600585154542-630846df5648?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A serene lagoon villa with open spaces, high ceilings, glass walls, direct lagoon access, and a private jetty.",
    features: ["5 Ensuite Bedrooms", "Infinity Pool", "Direct Lagoon Access", "Private Jetty", "Solar Power", "Staff Quarters"],
    agent: { name: "Chidinma Okoro", phone: "2349163113401", email: "chidinma@stayfinder.com" },
  },
  {
    id: 6,
    title: "The Corporate Suite",
    location: "Ikoyi, Lagos",
    price: 18000000,
    priceLabel: "NGN 18,000,000",
    type: "Premium Apartment",
    bedrooms: 3,
    bathrooms: 4,
    sizeSqm: 320,
    status: "available",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600585154542-630846df5648?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A furnished 3-bedroom apartment with high-end fittings and direct access to Ikoyi restaurants and offices.",
    features: ["3 Bedrooms", "Fully Furnished", "European Fittings", "Elevator", "Backup Power", "Secure Parking"],
    agent: { name: "Amaka Eze", phone: "2349163113401", email: "amaka@stayfinder.com" },
  },
  {
    id: 7,
    title: "The Garden Duplex",
    location: "Gbagada, Lagos",
    price: 95000000,
    priceLabel: "NGN 95,000,000",
    type: "Duplex",
    bedrooms: 4,
    bathrooms: 5,
    sizeSqm: 520,
    status: "available",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A family-friendly duplex in a secure neighborhood with generous natural light and a large private backyard.",
    features: ["4 Bedrooms", "Large Backyard", "C of O Title", "Family Lounge", "BQ", "Secure Estate"],
    agent: { name: "Bola Johnson", phone: "2349163113401", email: "bola@stayfinder.com" },
  },
  {
    id: 8,
    title: "Commercial Studio Unit",
    location: "Yaba, Lagos",
    price: 45000000,
    priceLabel: "NGN 45,000,000",
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 85,
    status: "available",
    image: "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600585154542-630846df5648?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A compact studio in Yaba's tech corridor, ideal for young professionals or short-let investment buyers.",
    features: ["Studio Layout", "Fitted Kitchenette", "High Rental Demand", "Secure Entry", "Backup Power"],
    agent: { name: "Aisha Musa", phone: "2349163113401", email: "aisha@stayfinder.com" },
  },
  {
    id: 9,
    title: "Eko Family Bungalow",
    location: "Ajah, Lagos",
    price: 60000000,
    priceLabel: "NGN 60,000,000",
    type: "Bungalow",
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 360,
    status: "available",
    image: "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A well-maintained single-level family bungalow in a calm part of Ajah with practical indoor and outdoor space.",
    features: ["3 Bedrooms", "Single-Level Layout", "Private Compound", "Family Lounge", "Parking", "Quiet Neighborhood"],
    agent: { name: "Godwin Nwachukwu", phone: "2349163113401", email: "godwin@stayfinder.com" },
  },
];

const rentProperties = [
  {
    id: 1,
    title: "Modern 2-Bedroom Apartment",
    location: "Ikeja, Lagos",
    price: 350000,
    priceLabel: "NGN 350,000 / year",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 120,
    status: "available",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A practical apartment in Ikeja with a spacious living room, fitted kitchen, steady water supply, and secure access.",
    features: ["2 Bedrooms", "Fitted Kitchen", "Secure Compound", "Water Supply", "Parking Space"],
    agent: { name: "Tunde Bakare", phone: "2349163113401", email: "tunde@stayfinder.com" },
  },
  {
    id: 2,
    title: "Marble Crest Villa",
    location: "Lekki Phase 1, Lagos",
    price: 2500000,
    priceLabel: "NGN 2,500,000 / year",
    type: "Luxury Villa",
    bedrooms: 4,
    bathrooms: 5,
    sizeSqm: 420,
    status: "available",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A high-end Lekki villa with ensuite rooms, modern finishes, private parking, and reliable estate security.",
    features: ["4 Ensuite Bedrooms", "Private Parking", "Estate Security", "Modern Kitchen", "Balcony"],
    agent: { name: "Ngozi Balogun", phone: "2349163113401", email: "ngozi@stayfinder.com" },
  },
  {
    id: 3,
    title: "Self-Contained Room",
    location: "Yaba, Lagos",
    price: 250000,
    priceLabel: "NGN 250,000 / year",
    type: "Self Contain",
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 45,
    status: "available",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A simple self-contained room close to Yaba transport routes, suitable for students and young professionals.",
    features: ["Single Room", "Private Bathroom", "Kitchenette", "Easy Transport Access", "Prepaid Meter"],
    agent: { name: "Aisha Musa", phone: "2349163113401", email: "aisha@stayfinder.com" },
  },
  {
    id: 4,
    title: "3-Bedroom Terrace Duplex",
    location: "Gbagada, Lagos",
    price: 1200000,
    priceLabel: "NGN 1,200,000 / year",
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 220,
    status: "available",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A family-ready terrace duplex with good room sizes, gated access, and a calm residential setting.",
    features: ["3 Bedrooms", "Gated Access", "Guest Toilet", "Family Lounge", "Parking"],
    agent: { name: "Bola Johnson", phone: "2349163113401", email: "bola@stayfinder.com" },
  },
  {
    id: 5,
    title: "Newly Built Mini Flat",
    location: "Surulere, Lagos",
    price: 600000,
    priceLabel: "NGN 600,000 / year",
    type: "Mini Flat",
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 70,
    status: "available",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A newly finished mini flat in Surulere with tiled rooms, fitted cabinets, and convenient road access.",
    features: ["Mini Flat", "Fitted Cabinets", "Tiled Floors", "Road Access", "Water Supply"],
    agent: { name: "Amaka Eze", phone: "2349163113401", email: "amaka@stayfinder.com" },
  },
  {
    id: 6,
    title: "Affordable Self Contain",
    location: "Oshodi, Lagos",
    price: 180000,
    priceLabel: "NGN 180,000 / year",
    type: "Self Contain",
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 38,
    status: "available",
    image: "https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A budget-friendly self contain with essential amenities and quick access to major transport routes.",
    features: ["Private Bathroom", "Kitchenette", "Prepaid Meter", "Transport Access", "Secure Entry"],
    agent: { name: "Godwin Nwachukwu", phone: "2349163113401", email: "godwin@stayfinder.com" },
  },
  {
    id: 7,
    title: "Modern Mini Flat with Balcony",
    location: "Lekki Phase 2, Lagos",
    price: 750000,
    priceLabel: "NGN 750,000 / year",
    type: "Mini Flat",
    bedrooms: 1,
    bathrooms: 2,
    sizeSqm: 85,
    status: "available",
    image: "https://images.unsplash.com/photo-1512918766674-ed62b9a39c52?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1512918766674-ed62b9a39c52?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A bright mini flat with a private balcony, visitor toilet, and quick access to Lekki amenities.",
    features: ["Private Balcony", "Visitor Toilet", "Fitted Kitchen", "Secure Compound", "Parking"],
    agent: { name: "Chidinma Okoro", phone: "2349163113401", email: "chidinma@stayfinder.com" },
  },
  {
    id: 8,
    title: "1 Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: 250000,
    priceLabel: "NGN 250,000 / year",
    type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 65,
    status: "available",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A compact Victoria Island apartment suited for city living, close to offices, restaurants, and shops.",
    features: ["1 Bedroom", "City Access", "Fitted Kitchen", "Secure Entry", "Water Supply"],
    agent: { name: "Femi Adesina", phone: "2349163113401", email: "femi@stayfinder.com" },
  },
  {
    id: 9,
    title: "Standard Self Contain",
    location: "Yaba, Lagos",
    price: 230000,
    priceLabel: "NGN 230,000 / year",
    type: "Self Contain",
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 42,
    status: "available",
    image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80",
    hero: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "A standard self contain near Yaba's education and tech corridor, with basic utilities in place.",
    features: ["Private Bathroom", "Kitchenette", "Prepaid Meter", "Secure Compound", "Transport Access"],
    agent: { name: "Aisha Musa", phone: "2349163113401", email: "aisha@stayfinder.com" },
  },
];

const getBuyProperties = () => {
  const listings = getAdminListings();
  const all = [...buyProperties, ...listings.buy];
  return all.filter((p) => !listings.deletedIds.includes(p.id));
};
const getRentProperties = () => {
  const listings = getAdminListings();
  const all = [...rentProperties, ...listings.rent];
  return all.filter((p) => !listings.deletedIds.includes(p.id));
};

const findBuyProperty = (propertyId) => {
  const id = Number(propertyId);
  return getBuyProperties().find((property) => property.id === id);
};

const findRentProperty = (propertyId) => {
  const id = Number(propertyId);
  return getRentProperties().find((property) => property.id === id);
};

const getBuyPropertySummary = (property) => ({
  id: property.id,
  title: property.title,
  location: property.location,
  price: property.price,
  priceLabel: property.priceLabel,
  type: property.type,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  sizeSqm: property.sizeSqm,
  status: property.status,
  image: property.image,
});

const getRentPropertySummary = (property) => ({
  id: property.id,
  title: property.title,
  location: property.location,
  price: property.price,
  priceLabel: property.priceLabel,
  type: property.type,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  sizeSqm: property.sizeSqm,
  status: property.status,
  image: property.image,
});

const getUserSavedBuyProperties = (userId) => {
  const savedIds = getSavedProperties()
    .filter((saved) => saved.userId === userId && saved.listingType === "buy")
    .map((saved) => saved.propertyId);

  return getBuyProperties()
    .filter((property) => savedIds.includes(property.id))
    .map(getBuyPropertySummary);
};

const getUserSavedRentProperties = (userId) => {
  const savedIds = getSavedProperties()
    .filter((saved) => saved.userId === userId && saved.listingType === "rent")
    .map((saved) => saved.propertyId);

  return getRentProperties()
    .filter((property) => savedIds.includes(property.id))
    .map(getRentPropertySummary);
};

const sortBuyProperties = (properties, sort) => {
  const sorted = [...properties];

  if (sort === "price_asc") {
    return sorted.sort((a, b) => a.price - b.price);
  }

  if (sort === "price_desc") {
    return sorted.sort((a, b) => b.price - a.price);
  }

  return sorted.sort((a, b) => a.id - b.id);
};

const sortRentProperties = (properties, sort) => {
  const sorted = [...properties];

  if (sort === "price_asc") {
    return sorted.sort((a, b) => a.price - b.price);
  }

  if (sort === "price_desc") {
    return sorted.sort((a, b) => b.price - a.price);
  }

  return sorted.sort((a, b) => a.id - b.id);
};

const fallbackPropertyImage =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

const formatNairaPrice = (price, listingType) => {
  const formatter = new Intl.NumberFormat("en-NG");
  const suffix = listingType === "rent" ? " / year" : "";
  return `NGN ${formatter.format(price)}${suffix}`;
};

const parseCsvList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => cleanText(item))
    .filter(Boolean);

const validateAdminPropertyInput = (input) => {
  const listingType = cleanText(input.listingType).toLowerCase();
  const title = cleanText(input.title);
  const location = cleanText(input.location);
  const type = cleanText(input.type);
  const description = cleanText(input.description);
  const price = Number(input.price);
  const bedrooms = Number(input.bedrooms);
  const bathrooms = Number(input.bathrooms);
  const sizeSqm = Number(input.sizeSqm);

  if (!["buy", "rent"].includes(listingType)) {
    throw createHttpError(400, "Listing type must be buy or rent");
  }

  if (!title || !location || !type || !description) {
    throw createHttpError(400, "Title, location, type, and description are required");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw createHttpError(400, "Price must be a positive number");
  }

  if (!Number.isFinite(bedrooms) || bedrooms < 0 || !Number.isFinite(bathrooms) || bathrooms < 0) {
    throw createHttpError(400, "Bedrooms and bathrooms must be valid numbers");
  }

  if (!Number.isFinite(sizeSqm) || sizeSqm <= 0) {
    throw createHttpError(400, "Size must be a positive number");
  }

  return {
    listingType,
    title,
    location,
    type,
    description,
    price,
    bedrooms,
    bathrooms,
    sizeSqm,
  };
};

const createAdminProperty = (input, adminId) => {
  const validated = validateAdminPropertyInput(input);
  const image = cleanText(input.image) || fallbackPropertyImage;
  const gallery = parseCsvList(input.gallery);
  const features = parseCsvList(input.features);

  return {
    id: Date.now(),
    title: validated.title,
    location: validated.location,
    price: validated.price,
    priceLabel: formatNairaPrice(validated.price, validated.listingType),
    type: validated.type,
    bedrooms: validated.bedrooms,
    bathrooms: validated.bathrooms,
    sizeSqm: validated.sizeSqm,
    status: "available",
    image,
    hero: cleanText(input.hero) || image,
    gallery: gallery.length ? gallery : [image],
    description: validated.description,
    features: features.length ? features : [`${validated.bedrooms} Bedrooms`, `${validated.bathrooms} Bathrooms`],
    agent: {
      name: cleanText(input.agentName) || "StayNest Admin",
      phone: cleanText(input.agentPhone) || "2349163113401",
      email: normalizeEmail(input.agentEmail) || config.adminEmail,
    },
    source: "admin",
    createdBy: adminId,
    createdAt: new Date().toISOString(),
  };
};

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "staynest-api",
    mode: {
      id: activeBackendMode.id,
      label: activeBackendMode.label,
      responseTone: activeBackendMode.responseTone,
    },
  });
});

app.get("/api/mode", (_req, res) => {
  res.json({
    mode: {
      id: activeBackendMode.id,
      label: activeBackendMode.label,
      responseTone: activeBackendMode.responseTone,
      signature: activeBackendMode.signature,
    },
  });
});

app.get("/api/buy/properties", (req, res) => {
  const search = cleanText(req.query.search).toLowerCase();
  const type = cleanText(req.query.type);
  const location = cleanText(req.query.location).toLowerCase();
  const minPrice = Number(req.query.minPrice) || 0;
  const maxPrice = Number(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);

  const allBuyProperties = getBuyProperties();
  const filtered = allBuyProperties.filter((property) => {
    const matchesSearch =
      !search ||
      property.title.toLowerCase().includes(search) ||
      property.location.toLowerCase().includes(search) ||
      property.type.toLowerCase().includes(search);
    const matchesType = !type || type === "All" || property.type === type;
    const matchesLocation = !location || location === "all" || property.location.toLowerCase().includes(location);
    const matchesPrice = property.price >= minPrice && property.price <= maxPrice;

    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });

  const sorted = sortBuyProperties(filtered, cleanText(req.query.sort));
  const start = (page - 1) * limit;
  const data = sorted.slice(start, start + limit).map(getBuyPropertySummary);

  res.json({
    data,
    meta: {
      total: filtered.length,
      page,
      limit,
      pages: Math.ceil(filtered.length / limit),
    },
  });
});

app.get("/api/buy/properties/:id", (req, res, next) => {
  const property = findBuyProperty(req.params.id);

  if (!property) {
    next(createHttpError(404, "Buy property not found"));
    return;
  }

  res.json({ property });
});

app.get("/api/buy/filters", (_req, res) => {
  const allBuyProperties = getBuyProperties();
  res.json({
    types: [...new Set(allBuyProperties.map((property) => property.type))].sort(),
    locations: [...new Set(allBuyProperties.map((property) => property.location))].sort(),
    priceRange: {
      min: Math.min(...allBuyProperties.map((property) => property.price)),
      max: Math.max(...allBuyProperties.map((property) => property.price)),
    },
  });
});

app.get("/api/buy/saved", requireAuth, (req, res) => {
  res.json({ data: getUserSavedBuyProperties(req.auth.id) });
});

app.post("/api/buy/saved", requireAuth, (req, res, next) => {
  const property = findBuyProperty(req.body.propertyId);

  if (!property) {
    next(createHttpError(404, "Buy property not found"));
    return;
  }

  const savedProperties = getSavedProperties();
  const alreadySaved = savedProperties.some(
    (saved) => saved.userId === req.auth.id && saved.listingType === "buy" && saved.propertyId === property.id
  );

  if (!alreadySaved) {
    const userSavedCount = savedProperties.filter(
      (saved) => saved.userId === req.auth.id && saved.listingType === "buy"
    ).length;

    if (userSavedCount >= config.maxSavedProperties) {
      next(createHttpError(400, "Saved property limit reached"));
      return;
    }

    savedProperties.push({
      id: crypto.randomUUID(),
      userId: req.auth.id,
      listingType: "buy",
      propertyId: property.id,
      createdAt: new Date().toISOString(),
    });
    saveSavedProperties(savedProperties);
  }

  res.status(201).json({
    message: "Property saved",
    data: getUserSavedBuyProperties(req.auth.id),
  });
});

app.delete("/api/buy/saved/:id", requireAuth, (req, res) => {
  const propertyId = Number(req.params.id);
  const savedProperties = getSavedProperties();
  const nextSavedProperties = savedProperties.filter(
    (saved) => !(saved.userId === req.auth.id && saved.listingType === "buy" && saved.propertyId === propertyId)
  );

  saveSavedProperties(nextSavedProperties);
  res.json({
    message: "Property removed from saved list",
    data: getUserSavedBuyProperties(req.auth.id),
  });
});

app.post(
  "/api/buy/inquiries",
  requireAuth,
  asyncRoute(async (req, res) => {
    const property = findBuyProperty(req.body.propertyId);
    const message = cleanText(req.body.message);
    const phone = cleanText(req.body.phone);

    if (!property) {
      throw createHttpError(404, "Buy property not found");
    }

    if (!message) {
      throw createHttpError(400, "Inquiry message is required");
    }

    const user = getUsers().find((item) => item.id === req.auth.id);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    const inquiry = {
      id: crypto.randomUUID(),
      propertyId: property.id,
      propertyTitle: property.title,
      buyer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone,
      },
      message,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    saveBuyInquiries([...getBuyInquiries(), inquiry]);

    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
    await sendEmail({
      toEmail: property.agent.email || config.adminEmail,
      toName: property.agent.name,
      subject: `New buyer inquiry: ${property.title}`,
      html: `
        <div style="${emailShellStyle()}">
          <h2 style="${emailHeadingStyle()}">New Buyer Inquiry</h2>
          <p><strong>Property:</strong> ${escapeHtml(property.title)}</p>
          <p><strong>Buyer:</strong> ${escapeHtml(user.name)} (${escapeHtml(user.email)})</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
          <p><strong>Message:</strong></p>
          <div style="${emailPanelStyle()}">${safeMessage}</div>
          ${emailModeNotice()}
        </div>
      `,
    });

    res.status(201).json({
      message: "Inquiry submitted successfully",
      inquiry,
    });
  })
);

app.get("/api/rent/properties", (req, res) => {
  const search = cleanText(req.query.search).toLowerCase();
  const type = cleanText(req.query.type);
  const location = cleanText(req.query.location).toLowerCase();
  const minPrice = Number(req.query.minPrice) || 0;
  const maxPrice = Number(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);

  const allRentProperties = getRentProperties();
  const filtered = allRentProperties.filter((property) => {
    const matchesSearch =
      !search ||
      property.title.toLowerCase().includes(search) ||
      property.location.toLowerCase().includes(search) ||
      property.type.toLowerCase().includes(search);
    const matchesType = !type || type === "All" || property.type === type;
    const matchesLocation = !location || location === "all" || property.location.toLowerCase().includes(location);
    const matchesPrice = property.price >= minPrice && property.price <= maxPrice;

    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });

  const sorted = sortRentProperties(filtered, cleanText(req.query.sort));
  const start = (page - 1) * limit;
  const data = sorted.slice(start, start + limit).map(getRentPropertySummary);

  res.json({
    data,
    meta: {
      total: filtered.length,
      page,
      limit,
      pages: Math.ceil(filtered.length / limit),
    },
  });
});

app.get("/api/rent/properties/:id", (req, res, next) => {
  const property = findRentProperty(req.params.id);

  if (!property) {
    next(createHttpError(404, "Rental property not found"));
    return;
  }

  res.json({ property });
});

app.get("/api/rent/filters", (_req, res) => {
  const allRentProperties = getRentProperties();
  res.json({
    types: [...new Set(allRentProperties.map((property) => property.type))].sort(),
    locations: [...new Set(allRentProperties.map((property) => property.location))].sort(),
    priceRange: {
      min: Math.min(...allRentProperties.map((property) => property.price)),
      max: Math.max(...allRentProperties.map((property) => property.price)),
    },
  });
});

app.get("/api/rent/saved", requireAuth, (req, res) => {
  res.json({ data: getUserSavedRentProperties(req.auth.id) });
});

app.post("/api/rent/saved", requireAuth, (req, res, next) => {
  const property = findRentProperty(req.body.propertyId);

  if (!property) {
    next(createHttpError(404, "Rental property not found"));
    return;
  }

  const savedProperties = getSavedProperties();
  const alreadySaved = savedProperties.some(
    (saved) => saved.userId === req.auth.id && saved.listingType === "rent" && saved.propertyId === property.id
  );

  if (!alreadySaved) {
    const userSavedCount = savedProperties.filter(
      (saved) => saved.userId === req.auth.id && saved.listingType === "rent"
    ).length;

    if (userSavedCount >= config.maxSavedProperties) {
      next(createHttpError(400, "Saved property limit reached"));
      return;
    }

    savedProperties.push({
      id: crypto.randomUUID(),
      userId: req.auth.id,
      listingType: "rent",
      propertyId: property.id,
      createdAt: new Date().toISOString(),
    });
    saveSavedProperties(savedProperties);
  }

  res.status(201).json({
    message: "Property saved",
    data: getUserSavedRentProperties(req.auth.id),
  });
});

app.delete("/api/rent/saved/:id", requireAuth, (req, res) => {
  const propertyId = Number(req.params.id);
  const savedProperties = getSavedProperties();
  const nextSavedProperties = savedProperties.filter(
    (saved) => !(saved.userId === req.auth.id && saved.listingType === "rent" && saved.propertyId === propertyId)
  );

  saveSavedProperties(nextSavedProperties);
  res.json({
    message: "Property removed from saved list",
    data: getUserSavedRentProperties(req.auth.id),
  });
});

app.post(
  "/api/rent/inquiries",
  requireAuth,
  asyncRoute(async (req, res) => {
    const property = findRentProperty(req.body.propertyId);
    const message = cleanText(req.body.message);
    const phone = cleanText(req.body.phone);

    if (!property) {
      throw createHttpError(404, "Rental property not found");
    }

    if (!message) {
      throw createHttpError(400, "Inquiry message is required");
    }

    const user = getUsers().find((item) => item.id === req.auth.id);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    const inquiry = {
      id: crypto.randomUUID(),
      propertyId: property.id,
      propertyTitle: property.title,
      renter: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone,
      },
      message,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    saveRentInquiries([...getRentInquiries(), inquiry]);

    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
    await sendEmail({
      toEmail: property.agent.email || config.adminEmail,
      toName: property.agent.name,
      subject: `New rental inquiry: ${property.title}`,
      html: `
        <div style="${emailShellStyle()}">
          <h2 style="${emailHeadingStyle()}">New Rental Inquiry</h2>
          <p><strong>Property:</strong> ${escapeHtml(property.title)}</p>
          <p><strong>Renter:</strong> ${escapeHtml(user.name)} (${escapeHtml(user.email)})</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
          <p><strong>Message:</strong></p>
          <div style="${emailPanelStyle()}">${safeMessage}</div>
          ${emailModeNotice()}
        </div>
      `,
    });

    res.status(201).json({
      message: "Inquiry submitted successfully",
      inquiry,
    });
  })
);

app.post(
  "/api/auth/signup",
  asyncRoute(async (req, res) => {
    const { name, email, password } = req.body;
    validateSignupInput({ name, email, password });

    const users = getUsers();
    const normalizedEmail = normalizeEmail(email);

    if (findUserByEmail(users, normalizedEmail)) {
      throw createHttpError(409, "User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, config.saltRounds);
    const code = generateVerificationCode();
    const pendingList = getPendingVerifications();
    const nextPendingList = pendingList.filter((pending) => pending.email !== normalizedEmail);

    nextPendingList.push({
      email: normalizedEmail,
      name: cleanText(name),
      passwordHash,
      codeHash: await bcrypt.hash(code, config.saltRounds),
      expiresAt: new Date(Date.now() + config.codeExpiryMinutes * 60 * 1000).toISOString(),
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    savePendingVerifications(nextPendingList);
    await sendEmail({
      toEmail: normalizedEmail,
      toName: name,
      subject: "Your StayNest verification code",
      html: verificationEmailHtml({ name, code }),
    });
    } catch (err) {
      console.error("Signup email failed:", err.message || err);
    }

    res.status(202).json({
      email: normalizedEmail,
      message: "Verification code sent. Please check your Gmail to complete signup.",
    });
  })
);

app.post(
  "/api/auth/verify-email",
  asyncRoute(async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body.email);
    const code = cleanText(req.body.code);

    if (!normalizedEmail || !code) {
      throw createHttpError(400, "Email and verification code are required");
    }

    if (!/^\d{7}$/.test(code)) {
      throw createHttpError(400, "Please enter a valid 7-digit code");
    }

    const pendingList = getPendingVerifications();
    const pendingIndex = pendingList.findIndex((pending) => pending.email === normalizedEmail);

    if (pendingIndex === -1) {
      throw createHttpError(400, "No pending signup found. Please sign up again.");
    }

    const pending = pendingList[pendingIndex];

    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      pendingList.splice(pendingIndex, 1);
      savePendingVerifications(pendingList);
      throw createHttpError(400, "Verification code has expired. Please sign up again.");
    }

    if (pending.attempts >= config.maxVerifyAttempts) {
      pendingList.splice(pendingIndex, 1);
      savePendingVerifications(pendingList);
      throw createHttpError(400, "Too many failed attempts. Please sign up again.");
    }

    const isCodeValid = await bcrypt.compare(code, pending.codeHash);
    if (!isCodeValid) {
      pending.attempts += 1;
      savePendingVerifications(pendingList);

      const remaining = config.maxVerifyAttempts - pending.attempts;
      throw createHttpError(
        400,
        remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many failed attempts. Please sign up again."
      );
    }

    const users = getUsers();
    if (findUserByEmail(users, normalizedEmail)) {
      pendingList.splice(pendingIndex, 1);
      savePendingVerifications(pendingList);
      throw createHttpError(409, "User with this email already exists");
    }

    const newUser = createUser({
      name: pending.name,
      email: normalizedEmail,
      passwordHash: pending.passwordHash,
    });

    saveUsers([...users, newUser]);
    pendingList.splice(pendingIndex, 1);
    savePendingVerifications(pendingList);
    sendWelcomeEmailInBackground(newUser);

    res.status(201).json({
      user: toPublicUser(newUser),
      token: signAuthToken(newUser),
      message: "Email verified and account created successfully",
    });
  })
);

app.post(
  "/api/auth/resend-code",
  asyncRoute(async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      throw createHttpError(400, "Email is required");
    }

    const pendingList = getPendingVerifications();
    const pending = pendingList.find((item) => item.email === normalizedEmail);

    if (!pending) {
      throw createHttpError(400, "No pending signup found. Please sign up again.");
    }

    const code = generateVerificationCode();
    pending.codeHash = await bcrypt.hash(code, config.saltRounds);
    pending.expiresAt = new Date(Date.now() + config.codeExpiryMinutes * 60 * 1000).toISOString();
    pending.attempts = 0;

    savePendingVerifications(pendingList);
    await sendEmail({
      toEmail: normalizedEmail,
      toName: pending.name,
      subject: "Your StayNest verification code",
      html: verificationEmailHtml({ name: pending.name, code }),
    });

    res.json({ message: "A new verification code has been sent to your Gmail" });
  })
);

app.post(
  "/api/auth/login",
  asyncRoute(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      throw createHttpError(400, "Email and password are required");
    }

    const user = findUserByEmail(getUsers(), email);
    const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordCorrect) {
      throw createHttpError(400, "Invalid email or password");
    }

    res.json({
      user: toPublicUser(user),
      token: signAuthToken(user),
      message: "Login successful",
    });
  })
);

app.post(
  "/api/auth/admin/signup",
  asyncRoute(async (req, res) => {
    const { name, email, password } = req.body;
    validateSignupInput({ name, email, password });

    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail !== "abdulqayyumayinla1707@gmail.com") {
      throw createHttpError(403, "Admin signup is restricted to the designated administrator email address only.");
    }

    const users = getUsers();

    if (findUserByEmail(users, normalizedEmail)) {
      throw createHttpError(409, "User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, config.saltRounds);
    const newAdmin = createUser({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    });

    saveUsers([...users, newAdmin]);
    sendWelcomeEmailInBackground(newAdmin);

    res.status(201).json({
      user: toPublicUser(newAdmin),
      token: signAuthToken(newAdmin),
      message: "Admin account created successfully",
    });
  })
);

app.post(
  "/api/auth/admin/login",
  asyncRoute(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      throw createHttpError(400, "Email and password are required");
    }

    if (email !== "abdulqayyumayinla1707@gmail.com") {
      throw createHttpError(403, "Admin portal login is restricted to the designated administrator email address only.");
    }

    const user = findUserByEmail(getUsers(), email);
    const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordCorrect) {
      throw createHttpError(400, "Invalid email or password");
    }

    if (getUserRole(user) !== "admin") {
      throw createHttpError(403, "This account does not have admin access");
    }

    res.json({
      user: toPublicUser(user),
      token: signAuthToken(user),
      message: "Admin login successful",
    });
  })
);

app.get(
  "/api/auth/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = getUsers().find((item) => item.id === req.auth.id);

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    res.json({ user: toPublicUser(user) });
  })
);

app.get(
  "/api/admin/summary",
  requireAuth,
  requireAdmin,
  (_req, res) => {
    const users = getUsers();
    const buyInquiries = getBuyInquiries();
    const rentInquiries = getRentInquiries();
    const allBuyProperties = getBuyProperties();
    const allRentProperties = getRentProperties();

    res.json({
      data: {
        users: users.length,
        clients: users.filter((user) => getUserRole(user) === "client").length,
        admins: users.filter((user) => getUserRole(user) === "admin").length,
        buyProperties: allBuyProperties.length,
        rentProperties: allRentProperties.length,
        adminBuyProperties: getAdminListings().buy.length,
        adminRentProperties: getAdminListings().rent.length,
        buyInquiries: buyInquiries.length,
        rentInquiries: rentInquiries.length,
        totalInquiries: buyInquiries.length + rentInquiries.length,
      },
    });
  }
);

app.post(
  "/api/admin/properties",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const property = createAdminProperty(req.body, req.auth.id);
    const listings = getAdminListings();
    const listingType = cleanText(req.body.listingType).toLowerCase();

    listings[listingType] = [property, ...listings[listingType]];
    saveAdminListings(listings);

    res.status(201).json({
      message: "Property added successfully",
      property,
    });
  })
);

app.get(
  "/api/admin/properties",
  requireAuth,
  requireAdmin,
  (_req, res) => {
    const buy = getBuyProperties().map(p => ({ ...p, listingType: "buy" }));
    const rent = getRentProperties().map(p => ({ ...p, listingType: "rent" }));
    res.json({ data: [...buy, ...rent].sort((a, b) => b.id - a.id) });
  }
);

app.delete(
  "/api/admin/properties/:id",
  requireAuth,
  requireAdmin,
  (req, res) => {
    const id = Number(req.params.id);
    const listings = getAdminListings();
    
    const originalBuyLen = listings.buy.length;
    const originalRentLen = listings.rent.length;
    
    listings.buy = listings.buy.filter((p) => p.id !== id);
    listings.rent = listings.rent.filter((p) => p.id !== id);
    
    if (listings.buy.length === originalBuyLen && listings.rent.length === originalRentLen) {
      if (!listings.deletedIds.includes(id)) {
        listings.deletedIds.push(id);
      }
    } else {
      if (!listings.deletedIds.includes(id)) {
        listings.deletedIds.push(id);
      }
    }
    
    saveAdminListings(listings);
    res.json({ message: "Property deleted successfully" });
  }
);

app.get(
  "/api/admin/inquiries",
  requireAuth,
  requireAdmin,
  (_req, res) => {
    const buy = getBuyInquiries().map(i => ({ ...i, type: "buy" }));
    const rent = getRentInquiries().map(i => ({ ...i, type: "rent" }));
    const all = [...buy, ...rent].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ data: all });
  }
);

app.patch(
  "/api/admin/inquiries/:id/status",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    
    if (!["new", "contacted", "closed"].includes(status)) {
      throw createHttpError(400, "Invalid status. Must be new, contacted, or closed.");
    }
    
    let updated = false;
    
    const buyInqs = getBuyInquiries();
    const buyIdx = buyInqs.findIndex((i) => i.id === id);
    if (buyIdx !== -1) {
      buyInqs[buyIdx].status = status;
      saveBuyInquiries(buyInqs);
      updated = true;
    }
    
    if (!updated) {
      const rentInqs = getRentInquiries();
      const rentIdx = rentInqs.findIndex((i) => i.id === id);
      if (rentIdx !== -1) {
        rentInqs[rentIdx].status = status;
        saveRentInquiries(rentInqs);
        updated = true;
      }
    }
    
    if (!updated) {
      throw createHttpError(404, "Inquiry not found");
    }
    
    res.json({ message: "Inquiry status updated successfully" });
  })
);

app.delete(
  "/api/admin/inquiries/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const id = req.params.id;
    let deleted = false;
    
    const buyInqs = getBuyInquiries();
    const nextBuy = buyInqs.filter((i) => i.id !== id);
    if (nextBuy.length !== buyInqs.length) {
      saveBuyInquiries(nextBuy);
      deleted = true;
    }
    
    if (!deleted) {
      const rentInqs = getRentInquiries();
      const nextRent = rentInqs.filter((i) => i.id !== id);
      if (nextRent.length !== rentInqs.length) {
        saveRentInquiries(nextRent);
        deleted = true;
      }
    }
    
    if (!deleted) {
      throw createHttpError(404, "Inquiry not found");
    }
    
    res.json({ message: "Inquiry deleted successfully" });
  })
);

app.get(
  "/api/admin/users",
  requireAuth,
  requireAdmin,
  (_req, res) => {
    const users = getUsers().map(toPublicUser);
    res.json({ data: users });
  }
);

app.patch(
  "/api/admin/users/:id/role",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const id = req.params.id;
    const { role } = req.body;
    
    if (!["admin", "client"].includes(role)) {
      throw createHttpError(400, "Invalid role. Must be admin or client.");
    }
    
    if (id === req.auth.id) {
      throw createHttpError(400, "You cannot modify your own role.");
    }
    
    const users = getUsers();
    const userIdx = users.findIndex((u) => u.id === id);
    if (userIdx === -1) {
      throw createHttpError(404, "User not found");
    }

    if (role === "admin" && users[userIdx].email !== "abdulqayyumayinla1707@gmail.com") {
      throw createHttpError(403, "Only the designated super admin account is allowed to hold the admin role.");
    }
    
    users[userIdx].role = role;
    saveUsers(users);
    
    res.json({ message: `User role updated to ${role} successfully` });
  })
);

app.delete(
  "/api/admin/users/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const id = req.params.id;
    
    if (id === req.auth.id) {
      throw createHttpError(400, "You cannot delete your own account.");
    }
    
    const users = getUsers();
    const nextUsers = users.filter((u) => u.id !== id);
    
    if (nextUsers.length === users.length) {
      throw createHttpError(404, "User not found");
    }
    
    saveUsers(nextUsers);
    res.json({ message: "User deleted successfully" });
  })
);

app.get(
  "/api/admin/settings",
  requireAuth,
  requireAdmin,
  (req, res) => {
    res.json({
      data: {
        gmailUser: config.gmailUser,
        hasGmailAppPassword: !!config.gmailAppPassword,
        hasBrevoApiKey: !!config.brevoApiKey,
        brevoSenderEmail: config.brevoSenderEmail,
        brevoSenderName: config.brevoSenderName,
        preferredProvider: config.preferredProvider,
      }
    });
  }
);

app.post(
  "/api/admin/settings",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const {
      gmailUser,
      gmailAppPassword,
      brevoApiKey,
      brevoSenderEmail,
      brevoSenderName,
      preferredProvider,
    } = req.body;

    if (gmailUser !== undefined) config.gmailUser = gmailUser;
    if (gmailAppPassword !== undefined) {
      // If it is '********', don't overwrite the existing password
      if (gmailAppPassword !== "********") {
        config.gmailAppPassword = gmailAppPassword;
      }
    }
    if (brevoApiKey !== undefined) {
      // If it is '********', don't overwrite the existing API key
      if (brevoApiKey !== "********") {
        config.brevoApiKey = brevoApiKey;
      }
    }
    if (brevoSenderEmail !== undefined) config.brevoSenderEmail = brevoSenderEmail;
    if (brevoSenderName !== undefined) config.brevoSenderName = brevoSenderName;
    if (preferredProvider !== undefined) config.preferredProvider = preferredProvider;

    const settingsToSave = {
      gmailUser: config.gmailUser,
      gmailAppPassword: config.gmailAppPassword,
      brevoApiKey: config.brevoApiKey,
      brevoSenderEmail: config.brevoSenderEmail,
      brevoSenderName: config.brevoSenderName,
      preferredProvider: config.preferredProvider,
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settingsToSave, null, 2));

    res.json({
      message: "Settings saved successfully",
      data: {
        gmailUser: config.gmailUser,
        hasGmailAppPassword: !!config.gmailAppPassword,
        hasBrevoApiKey: !!config.brevoApiKey,
        brevoSenderEmail: config.brevoSenderEmail,
        brevoSenderName: config.brevoSenderName,
        preferredProvider: config.preferredProvider,
      }
    });
  })
);

app.post(
  "/api/admin/settings/test-email",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const { testEmail, provider } = req.body;
    if (!testEmail) {
      throw createHttpError(400, "Test email address is required");
    }

    const testSubject = `StayNest Mailer Connection Test (${provider || "active"})`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #d1d5db; border-radius: 6px; color: #111827;">
        <h2 style="color: #0f766e; text-align: center; margin-top: 0;">StayNest Test Email</h2>
        <p>Hello,</p>
        <p>This is a test email sent from the StayNest Admin Panel to verify that your email configuration works.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; border-left: 4px solid #0f766e; margin: 20px 0;">
          <strong>Configuration Details Tested:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li><strong>Mailer Provider:</strong> ${provider || "active configuration"}</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          </ul>
        </div>
        <p style="font-size: 12px; color: #6b7280; text-align: center;">If you received this, your email configuration is fully functional!</p>
      </div>
    `;

    try {
      if (provider === "gmail") {
        await sendEmailViaGmail({ toEmail: testEmail, subject: testSubject, html: testHtml });
      } else if (provider === "brevo") {
        await sendEmailViaBrevo({ toEmail: testEmail, toName: "Test Recipient", subject: testSubject, html: testHtml });
      } else {
        await sendEmail({ toEmail: testEmail, toName: "Test Recipient", subject: testSubject, html: testHtml });
      }
      res.json({ message: "Test email sent successfully" });
    } catch (err) {
      console.error("Test email failed:", err);
      throw createHttpError(500, err.message || "Failed to send test email");
    }
  })
);

app.post(
  "/api/contact",
  asyncRoute(async (req, res) => {
    const name = cleanText(req.body.name);
    const email = normalizeEmail(req.body.email);
    const message = cleanText(req.body.message);

    if (!name || !email || !message) {
      throw createHttpError(400, "All fields are required");
    }

    if (!isEmail(email)) {
      throw createHttpError(400, "Please enter a valid email address");
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    await sendEmail({
      toEmail: config.adminEmail,
      toName: "StayNest Admin",
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="${emailShellStyle()}">
          <h2 style="${emailHeadingStyle()}">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <div style="${emailPanelStyle()}">${safeMessage}</div>
          ${emailModeNotice()}
        </div>
      `,
    });

    await sendEmail({
      toEmail: email,
      toName: name,
      subject: "We received your message - StayNest",
      html: `
        <div style="${emailShellStyle()}">
          <h2 style="${emailHeadingStyle()}">Thank You For Contacting StayNest</h2>
          <p>Hello ${safeName},</p>
          <p>We have received your message. Our team will review it and respond as soon as possible.</p>
          <p><strong>Your Message:</strong></p>
          <div style="${emailPanelStyle()}">${safeMessage}</div>
          <hr style="border: 0; border-top: 1px solid ${activeBackendMode.borderColor}; margin: 20px 0;" />
          ${emailModeNotice()}
          <p style="${emailFooterStyle()}">${activeBackendMode.signature}</p>
        </div>
      `,
    });

    res.json({ message: "Message submitted successfully" });
  })
);

app.post(
  "/api/subscribe",
  asyncRoute(async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      throw createHttpError(400, "Email is required");
    }

    if (!isEmail(email)) {
      throw createHttpError(400, "Please enter a valid email address");
    }

    await sendEmail({
      toEmail: email,
      toName: "Valued Subscriber",
      subject: "Subscription Confirmed - StayNest Newsletter",
      html: `
        <div style="${emailShellStyle()}">
          <h2 style="${emailHeadingStyle("center")}">StayNest Newsletter Subscription Confirmed</h2>
          <p>Hello,</p>
          <p>Your subscription has been confirmed. You will receive property updates, housing guidance, and market insights from StayNest.</p>
          <div style="background-color: ${activeBackendMode.panelBackground}; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
            <span style="font-size: 14px; color: #374151;">Subscriber Email: <strong>${escapeHtml(email)}</strong></span>
          </div>
          <hr style="border: 0; border-top: 1px solid ${activeBackendMode.borderColor}; margin: 20px 0;" />
          ${emailModeNotice()}
          <p style="${emailFooterStyle("center")}">${activeBackendMode.signature}, Lagos, Nigeria</p>
        </div>
      `,
    });

    res.json({ message: "Subscription confirmed" });
  })
);

app.use((req, _res, next) => {
  next(createHttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use((error, _req, res, next) => {
  void next;

  const status = error.status || 500;
  const message = status >= 500 ? "Internal server error" : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ message });
});

app.listen(config.port, () => {
  console.log(`StayNest API is running on port ${config.port}`);
  console.log(`Backend mode: ${activeBackendMode.label} (${activeBackendMode.id})`);
  console.log(`Allowed client origins: ${config.clientOrigins.join(", ")}`);

  const provider = config.preferredProvider === "auto"
    ? (config.gmailAppPassword ? "gmail" : (config.brevoApiKey ? "brevo" : "logger"))
    : config.preferredProvider;

  if (provider === "gmail" && config.gmailAppPassword) {
    console.log(`Email provider: Gmail (${config.gmailUser})`);
  } else if (provider === "brevo" && config.brevoApiKey) {
    console.log(`Email provider: Brevo (${config.brevoSenderEmail})`);
  } else {
    console.warn(`Email provider: development logger only (${provider === "logger" ? "explicitly set" : "fallback"})`);
  }
});
