const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Pixel = require('./models/pixel');

const app = express();

// Middleware
app.use(cors());

app.use(express.json({ limit: '10mb' })); // supports large base64 image uploads

// Connect to Database
connectDB();

// Route to accept images into the database
app.post('/api/upload', async (req, res) => {
    try {
      const { user, tileIndex, imageData } = req.body;
  
      if (!imageData) {
        return res.status(400).json({ message: 'Image data is required' });
      }
  
      const newPixel = new Pixel({
        user,
        tileIndex,
        imageData
      });
  
      await newPixel.save();
  
      res.status(201).json({ message: 'Pixel with image saved', pixel: newPixel });
    } catch (error) {
      console.error('Error saving image:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// GET /api/pixels
app.get("/api/pixels", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  try {
    const pixels = await Pixel.find({})
      .sort({ date: -1 }) // optional: latest first
      .skip(skip)
      .limit(limit);

    const response = pixels.map(p => ({
      tileIndex: p.tileIndex,
      imageData: p.imageData,
      user: p.user,
      date: p.date,
    }));

    res.status(200).json(response); // ✅ return array directly
  } catch (err) {
    console.error("Error fetching pixels:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




  app.patch('/api/pixels/:tileIndex', async (req, res) => {
    try {
      const { tileIndex } = req.params;
      const { user, imageData } = req.body;
  
      if (!imageData) {
        return res.status(400).json({ message: 'Image data is required' });
      }
  
      // Find and update the image for the given tileIndex
      const updatedPixel = await Pixel.findOneAndUpdate(
        { tileIndex: parseInt(tileIndex) },  // Find the pixel by tileIndex
        { 
          $set: { 
            imageData,  // Update the image data
            user,
            date: new Date(),  // Optionally, update the date
          },
        },
        { new: true }  // Return the updated document
      );
  
      if (!updatedPixel) {
        return res.status(404).json({ message: 'Tile not found' });
      }
  
      res.status(200).json({ message: 'Tile updated successfully', pixel: updatedPixel });
    } catch (error) {
      console.error('Error updating tile:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
 
  app.delete('/api/pixels/:tileIndex', async (req, res) => {
    try {
      const { tileIndex } = req.params;
  
      // Delete the image for the given tile index
      const deletedPixel = await Pixel.findOneAndDelete({ tileIndex: parseInt(tileIndex) });
  
      if (!deletedPixel) {
        return res.status(404).json({ message: 'Tile not found' });
      }
  
      res.status(200).json({ message: 'Tile image deleted successfully' });
    } catch (error) {
      console.error('Error deleting tile:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
