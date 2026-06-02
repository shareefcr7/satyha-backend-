const Mongoose = require('mongoose');
const { Schema } = Mongoose;

const BannerSchema = new Schema({
  desktopImage: {
    type: String,
    required: true,
  },
  mobileImage: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  desktopFit: {
    type: String,
    default: 'cover'
  },
  desktopPosition: {
    type: String,
    default: 'center'
  },
  mobileFit: {
    type: String,
    default: 'cover'
  },
  mobilePosition: {
    type: String,
    default: 'center'
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Mongoose.model('Banner', BannerSchema);
