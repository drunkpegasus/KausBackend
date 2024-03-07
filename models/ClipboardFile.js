const mongoose = require('mongoose');

const clipboardFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const ClipboardFile = mongoose.model('ClipboardFile', clipboardFileSchema);

module.exports = ClipboardFile;
