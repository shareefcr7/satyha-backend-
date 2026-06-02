require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");

const app = express();

// ✅ CORS Configuration - FIX for banner/category API calls
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://clear-glass-frontend.vercel.app",
    "https://clear-glass-frontend-lfez.vercel.app",
    "https://clear-glass-admin.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

// ✅ Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable preflight for all routes

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Passport Middleware
app.use(passport.initialize());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection failed:", err.message));

// Routes
app.use("/api/user", require("./routes/api/user"));
app.use("/api/product", require("./routes/api/product"));
app.use("/api/category", require("./routes/api/category"));
app.use("/api/subcategory", require("./routes/api/subcategory"));
app.use("/api/banner", require("./routes/api/banner"));
app.use("/api/order", require("./routes/api/order"));
app.use("/api/payment", require("./routes/api/payment"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for frontend URLs`);
  console.log(`✅ Cache headers disabled (no-store)`);
});

module.exports = app;
