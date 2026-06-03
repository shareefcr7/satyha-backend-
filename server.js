require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://clear-glass-frontend.vercel.app",
    "https://clear-glass-admin.vercel.app",
    "https://clear-glass-admin-oxsm.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(passport.initialize());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Server running" });
});

// Seed admin endpoint (for initial setup)
app.get("/seed-admin", async (req, res) => {
  try {
    const User = require('./models/user');
    const { ROLES } = require('./constants');
    
    const adminEmail = 'admin@clearglass.com';
    const adminPassword = 'admin123';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Admin already exists",
        credentials: { email: adminEmail, password: adminPassword }
      });
    }
    
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      firstName: 'ClearGlass',
      lastName: 'Admin',
      role: ROLES.Admin
    });
    
    await adminUser.save();
    
    res.json({
      success: true,
      message: "Admin created successfully",
      credentials: { email: adminEmail, password: adminPassword }
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection failed:", err.message));

// Routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/user", require("./routes/api/user"));
app.use("/api/product", require("./routes/api/product"));
app.use("/api/category", require("./routes/api/category"));
app.use("/api/subcategory", require("./routes/api/subcategory"));
app.use("/api/banner", require("./routes/api/banner"));

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
