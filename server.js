require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://clearglass.vercel.app"
  ],
  credentials: true
}));
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '50mb' }));
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
    
    // First try to find existing admin
    let existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists, resetting password...');
      // Update password
      existingAdmin.password = adminPassword;
      existingAdmin.role = ROLES.Admin;
      await existingAdmin.save();
      return res.json({
        success: true,
        message: "Admin already exists - password reset",
        credentials: { email: adminEmail, password: adminPassword }
      });
    }
    
    // Create new admin
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      firstName: 'ClearGlass',
      lastName: 'Admin',
      role: ROLES.Admin,
      provider: 'Email'
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    
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

// Seed data endpoint (for initial setup)
app.get("/seed-data", async (req, res) => {
  try {
    const Product = require('./models/product');
    const Banner = require('./models/banner');
    
    // Delete all existing products
    await Product.deleteMany({});
    
    // Seed products with all required fields
    const products = [
      {
        name: "Premium Glass Set",
        shortDescription: "High-quality transparent glass set",
        description: "Premium quality transparent glass set with perfect clarity and finish. Ideal for everyday use.",
        mrpPrice: 1500,
        offerAmount: 300,
        sellingPrice: 1200,
        totalStock: 50,
        mainImage: "https://images.unsplash.com/photo-1622197980942-a06db25d5fe6?w=400&h=400&fit=crop",
        gallery: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop"],
        isActive: true
      },
      {
        name: "Crystal Water Glasses",
        shortDescription: "Elegant crystal water glasses",
        description: "Elegant crystal clear water glasses with modern design. Perfect for dining and entertaining.",
        mrpPrice: 2000,
        offerAmount: 400,
        sellingPrice: 1600,
        totalStock: 40,
        mainImage: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop",
        gallery: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop"],
        isActive: true
      },
      {
        name: "Juice Glass Collection",
        shortDescription: "Durable juice glass collection",
        description: "Durable and stylish juice glass collection. Available in various sizes and colors.",
        mrpPrice: 1200,
        offerAmount: 200,
        sellingPrice: 1000,
        totalStock: 60,
        mainImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
        gallery: ["https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop"],
        isActive: true
      }
    ];
    
    const createdProducts = await Product.insertMany(products);
    console.log('✅ Products seeded successfully');
    
    // Delete all existing banners
    await Banner.deleteMany({});
    
    // Seed banners
    const banners = [
      {
        desktopImage: "https://images.unsplash.com/photo-1611426182858-430dbf3ee7b8?w=1200&h=400&fit=crop",
        mobileImage: "https://images.unsplash.com/photo-1611426182858-430dbf3ee7b8?w=400&h=600&fit=crop",
        desktopFit: "cover",
        desktopPosition: "center",
        mobileFit: "cover",
        mobilePosition: "center",
        isActive: true
      },
      {
        desktopImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&h=400&fit=crop",
        mobileImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=600&fit=crop",
        desktopFit: "cover",
        desktopPosition: "center",
        mobileFit: "cover",
        mobilePosition: "center",
        isActive: true
      }
    ];
    
    const createdBanners = await Banner.insertMany(banners);
    console.log('✅ Banners seeded successfully');
    
    res.json({
      success: true,
      message: "Data seeded successfully",
      data: {
        productsCreated: createdProducts.length,
        bannersCreated: createdBanners.length
      }
    });
  } catch (error) {
    console.error('Seed data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check with diagnostics
app.get("/health", async (req, res) => {
  try {
    // Check MongoDB
    const mongoConnected = mongoose.connection.readyState === 1;
    
    // Count users
    const User = require('./models/user');
    const userCount = await User.countDocuments();
    
    // Count products
    const Product = require('./models/product');
    const productCount = await Product.countDocuments();
    
    res.json({
      status: "Server running",
      mongodb: mongoConnected ? "connected" : "disconnected",
      database: {
        users: userCount,
        products: productCount
      },
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      error: error.message
    });
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
