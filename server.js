require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Server running" });
});

// CORS
app.use(cors());

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Test Routes
app.get("/api/banner", (req, res) => {
  res.json({ banners: [] });
});

app.get("/api/product", (req, res) => {
  res.json({ products: [] });
});

app.get("/api/category", (req, res) => {
  res.json({ categories: [] });
});

app.post("/api/auth/login", (req, res) => {
  res.json({ token: "test-token" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Server error" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
