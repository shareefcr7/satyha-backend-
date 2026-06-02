const Mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const { Schema } = Mongoose;

// Prevent duplicate plugin registration on Vercel serverless
if (!Mongoose.__slugPluginRegistered) {
  Mongoose.plugin(slug, { separator: '-', lang: 'en', truncate: 120 });
  Mongoose.__slugPluginRegistered = true;
}

const ProductSchema = new Schema({
  // Basic Information
  name: { type: String, trim: true, required: true },
  slug: { type: String, slug: 'name', unique: true },
  shortDescription: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },

  // Category & Brand
  category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  subcategory: { type: Schema.Types.ObjectId, ref: 'Subcategory', default: null },

  // Images
  mainImage: { type: String, default: '' },        // Primary product image
  gallery: [{ type: String }],                      // Additional gallery images (max 4)

  // Pricing
  mrpPrice: { type: Number, required: true, min: 0 },           // List price
  offerAmount: { type: Number, default: 0, min: 0 },            // Discount amount (₹)
  sellingPrice: { type: Number, required: true, min: 0 },       // Calculated: mrpPrice - offerAmount

  // Inventory
  totalStock: { type: Number, required: true, default: 0, min: 0 },

  // Status
  isActive: { type: Boolean, default: true },
  updated: Date,
  created: { type: Date, default: Date.now }
});

// Pre-save hook to auto-calculate selling price
ProductSchema.pre('save', function(next) {
  if (this.mrpPrice !== undefined && this.offerAmount !== undefined) {
    this.sellingPrice = Math.max(0, this.mrpPrice - this.offerAmount);
  }
  next();
});

module.exports = Mongoose.model('Product', ProductSchema);
