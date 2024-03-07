const express = require('express');
const router = express.Router();
const ClipboardFile = require('../models/ClipboardFile');

router.get('/', async (req, res) => {
  try {
    const files = await ClipboardFile.find();
    res.json(files);
  } catch (error) {
    console.error('Error fetching clipboard files:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { filename, content } = req.body;
    const newFile = new ClipboardFile({ filename, content });
    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error creating clipboard file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
