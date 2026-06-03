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

// Seed data endpoint (creates sample products and banners)
app.get("/seed-data", async (req, res) => {
  try {
    const Product = require('./models/product');
    const Banner = require('./models/banner');
    const Category = require('./models/category');
    
    // Create categories
    let glassCategory = await Category.findOne({ name: 'Clear Glass' });
    if (!glassCategory) {
      glassCategory = await Category.create({
        name: 'Clear Glass',
        description: 'Premium car wash products',
        isActive: true
      });
    }
    
    // Create sample products with Cloudinary images
    const sampleProducts = [
      {
        name: 'Premium Car Wash Polish',
        shortDescription: 'Professional grade car polish',
        description: 'High-quality car wash polish for professional results',
        category: glassCategory._id,
        mainImage: 'https://res.cloudinary.com/dqzajyxfn/image/upload/v1/samples/shoes.jpg',
        gallery: [],
        mrpPrice: 1200,
        offerAmount: 200,
        totalStock: 50,
        isActive: true
      },
      {
        name: 'Car Wax Shine',
        shortDescription: 'Long-lasting car wax',
        description: 'Advanced formula for superior shine and protection',
        category: glassCategory._id,
        mainImage: 'https://res.cloudinary.com/dqzajyxfn/image/upload/v1/samples/kitchen-tools.jpg',
        gallery: [],
        mrpPrice: 1500,
        offerAmount: 300,
        totalStock: 30,
        isActive: true
      },
      {
        name: 'Glass Cleaner Spray',
        shortDescription: 'Crystal clear windows',
        description: 'Streak-free glass cleaning solution',
        category: glassCategory._id,
        mainImage: 'https://res.cloudinary.com/dqzajyxfn/image/upload/v1/samples/coffee.jpg',
        gallery: [],
        mrpPrice: 500,
        offerAmount: 100,
        totalStock: 100,
        isActive: true
      }
    ];
    
    // Insert products if they don't exist
    let productCount = 0;
    for (const product of sampleProducts) {
      const exists = await Product.findOne({ name: product.name });
      if (!exists) {
        await Product.create(product);
        productCount++;
      }
    }
    
    // Create sample banners
    const sampleBanners = [
      {
        desktopImage: 'https://res.cloudinary.com/dqzajyxfn/image/upload/v1/samples/bike.jpg',
        mobileImage: 'https://res.cloudinary.com/dqzajyxfn/image/upload/v1/samples/bike.jpg',
        isActive: true
      }
    ];
    
    // Insert banners if they don't exist
    let bannerCount = 0;
    const existingBanners = await Banner.countDocuments();
    if (existingBanners === 0) {
      for (const banner of sampleBanners) {
        await Banner.create(banner);
        bannerCount++;
      }
    }
    
    res.json({
      success: true,
      message: 'Seed data created',
      created: {
        products: productCount,
        banners: bannerCount
      }
    });
  } catch (error) {
    console.error('Seed data error:', error);
    res.status(500).json({ error: error.message });
  }
});
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
