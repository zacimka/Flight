const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const rateLimiter = require("./middlewares/rateLimiter");

dotenv.config({ path: require("path").join(__dirname, ".env") });
connectDB();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(rateLimiter);

// Stripe webhook requires raw body parser
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

// Status Check
app.get("/api/status", (req, res) => res.json({ status: "ZamGo Travel API is online", timestamp: new Date() }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/flights", require("./routes/flights"));
app.use("/api/duffel", require("./routes/duffel"));
app.use("/api/airports", require("./routes/airports"));
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
