const mongoose = require('mongoose');

const pixelSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  user: {
    type: String, // Can still reference a username or ObjectId later
    required: false
  },
  tileIndex: {
    type: Number,
    required: false,
    index: true // Index for faster queries
  },
  imageData: {
    type: String, // Store base64 string (e.g., "data:image/png;base64,...")
    required: true
  }
});

const Pixel = mongoose.model('Pixel', pixelSchema);

module.exports = Pixel;
