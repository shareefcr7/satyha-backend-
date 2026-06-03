const express = require('express');
const router = express.Router();
const Banner = require('../../models/banner');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');
const cloudinary = require('../../config/cloudinary');

// GET all banners (public or admin)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.status(200).json({ banners });
  } catch (error) {
    res.status(400).json({ error: 'Your request could not be processed. Please try again.' });
  }
});

// POST add banner
router.post('/add', auth,  async (req, res) => {
  try {
    const { desktopImage, mobileImage, desktopFit, desktopPosition, mobileFit, mobilePosition } = req.body;

    if (!desktopImage || !mobileImage) {
      return res.status(400).json({ error: 'You must provide both desktop and mobile images.' });
    }
      const desktopUpload = await cloudinary.uploader.upload(desktopImage, {
      folder: 'banners/desktop'
    });

    // ✅ Upload mobile image
    const mobileUpload = await cloudinary.uploader.upload(mobileImage, {
      folder: 'banners/mobile'
    });


    // const banner = new Banner({ desktopImage, mobileImage });
     const banner = new Banner({
      desktopImage: desktopUpload.secure_url,
      mobileImage: mobileUpload.secure_url,
      desktopFit,
      desktopPosition,
      mobileFit,
      mobilePosition
    });
    const savedBanner = await banner.save();

    res.status(200).json({
      success: true,
      message: 'Banner has been added successfully!',
      banner: savedBanner
    });
  } catch (error) {
    res.status(400).json({ error: 'Your request could not be processed. Please try again.' });
  }
});

// DELETE banner
// DELETE banner (also remove images from Cloudinary when present)
router.delete('/delete/:id', auth,  async (req, res) => {
  try {
    const b = await Banner.findById(req.params.id);
    if (!b) return res.status(404).json({ error: 'Banner not found.' });

    // attempt to delete images from Cloudinary if URLs exist
    const attempts = [];
    const deleteFromCloudinary = async (url) => {
      if (!url) return;
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(p => p === 'upload');
      if (uploadIndex === -1) return;
      let publicParts = parts.slice(uploadIndex + 1).join('/');
      publicParts = publicParts.replace(/^v\d+\//, '');
      const publicId = publicParts.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.warn('Failed to destroy banner image:', publicId, e.message || e);
      }
    };

    attempts.push(deleteFromCloudinary(b.desktopImage));
    attempts.push(deleteFromCloudinary(b.mobileImage));

    await Promise.all(attempts);

    const banner = await Banner.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Banner has been deleted successfully!',
      banner
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(400).json({ error: 'Your request could not be processed. Please try again.' });
  }
});

// PUT update banner active status or details
router.put('/:id', auth,async (req, res) => {
  try {
    const bannerId = req.params.id;
    const update = req.body.banner;

    await Banner.findOneAndUpdate({ _id: bannerId }, update, { new: true });

    res.status(200).json({
      success: true,
      message: 'Banner has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({ error: 'Your request could not be processed. Please try again.' });
  }
});

module.exports = router;
