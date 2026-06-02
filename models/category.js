const Mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const { Schema } = Mongoose;

const options = {
  separator: '-',
  lang: 'en',
  truncate: 120
};

// ✅ Prevent duplicate plugin registration on Vercel serverless restarts
if (!Mongoose.__slugPluginRegistered) {
  Mongoose.plugin(slug, options);
  Mongoose.__slugPluginRegistered = true;
}

// SubCategory Schema (embedded)
const SubCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    slug: 'name'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const CategorySchema = new Schema({
  _id: {
    type: Schema.ObjectId,
    auto: true
  },

  name: {
    type: String,
    trim: true
  },

  slug: {
    type: String,
    slug: 'name',
    unique: true
  },

  // ✅ FIXED: Accept string (Cloudinary URL) instead of Buffer
  image: {
    type: String
  },

  description: {
    type: String,
    trim: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],

  subCategories: [SubCategorySchema],

  updated: Date,

  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Category', CategorySchema);