const mongoose = require("mongoose");

const connectDB = async () => {
  const URI = process.env.MONGO_URI;
  if (!URI) {
    throw new Error("MONGO_URI is not defined in env");
  }
  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};

module.exports = connectDB;
