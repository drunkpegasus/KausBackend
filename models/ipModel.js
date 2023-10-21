const mongoose = require('mongoose');

const ipSchema = new mongoose.Schema({
  ipAddress: String,
  page: String,
  userAgent: String,
  operatingSystem: String,
  device: String,
  timestamp: { type: Date, default: Date.now },
  formattedTimestamp: String,
});

ipSchema.virtual('formatted').get(function () {
  const timestamp = this.timestamp;

  // Convert to IST (UTC+5:30)
  const indianTimestamp = new Date(timestamp.getTime() + 330 * 60000);

  // Format timestamp to YYYY-MM-DD HH:MM:SS.MS
  const formattedDate = indianTimestamp
    .toISOString()
    .replace(/[TZ]/g, ' ')
    .trim();
  return formattedDate;
});

ipSchema.pre('save', function (next) {
  this.formattedTimestamp = this.formatted;
  next();
});

module.exports = mongoose.model('IP', ipSchema);
