const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const rateLimiter = require("./middlewares/rateLimiter");

dotenv.config(); // Standard initialization to allow OS-level env vars (Render) to take precedence

// Strict Environment Validations
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  console.error("❌ CRITICAL ERROR: MongoDB URI is missing from environment variables!");
  process.exit(1);
}
if (process.env.DUFFEL_API_KEY) {
  const prefix = process.env.DUFFEL_API_KEY.substring(0, 11);
  console.log(`[Config] Duffel Token detected starting with: ${prefix}...`);
}
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ CRITICAL ERROR: Stripe Secret Key is missing!");
  process.exit(1);
}
// Normalize env aliases for seamless deployment
if (process.env.MONGODB_URI) process.env.MONGO_URI = process.env.MONGODB_URI;
if (!process.env.DUFFEL_API_KEY) {
  process.env.DUFFEL_API_KEY = process.env.DUFFEL_ACCESS_TOKEN;
}

connectDB();

const app = express();
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
const allowedOrigins = [
  'https://zamgotravel.com',
  'https://www.zamgotravel.com',
  'https://flight-1-ca15.onrender.com',
  'https://flight-8tvi.onrender.com',
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost:3002'
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true); // Failsafe: allow all while debugging
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(rateLimiter);

// Stripe webhook requires raw body parser
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

// Status Check
app.get("/api/status", (req, res) => res.json({ status: "ZamGo Travel API is online", timestamp: new Date() }));

// NODE_ENV management
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/duffel", require("./routes/duffel"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/contact", require("./routes/contacts"));
app.use("/api/webhooks", require("./routes/webhooks"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
