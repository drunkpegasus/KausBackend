const mongoose = require('mongoose');

const ipSchema = new mongoose.Schema({
  ipAddress: String,
  page: String,
  userAgent: String,
  operatingSystem: String,
  device: String,
  timestamp: { type: Date, default: Date.now },
  formattedTimestamp: String,
  dayOfWeek: String,
  accessTime: String, // New field for human-readable access time
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

  // Get day of the week
  const dayOfWeek = indianTimestamp.toLocaleDateString('en-US', { weekday: 'long' });

  // Set the new fields
  this.dayOfWeek = dayOfWeek;
  this.accessTime = extractAccessTime(formattedDate);

  return formattedDate;
});

ipSchema.pre('save', function (next) {
  this.formattedTimestamp = this.formatted;
  next();
});

function extractAccessTime(formattedDate) {
  // Extracting HH:MM:SS, DD, MM, YYYY from formattedDate
  const timeAndDate = formattedDate.split(' ');
  const time = timeAndDate[1].substring(0, 8);
  const dateParts = timeAndDate[0].split('-');
  const day = dateParts[2];
  const month = dateParts[1];
  const year = dateParts[0];

  // Getting the day of the week
  const dayOfWeek = getDayOfWeek(new Date(formattedDate));

  // Formatting hours to 12-hour format
  const hours = parseInt(time.substring(0, 2), 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;

  // Define the separator
  const separator = ' | ';

  // Combining the required parts with separator
  const accessTime = `${formattedHours}:${time.substring(3)} ${ampm}${separator}${day}-${month}-${year}${separator}${dayOfWeek}`;
  return accessTime;
}


function getDayOfWeek(date) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return daysOfWeek[date.getDay()];
}



module.exports = mongoose.model('IP', ipSchema);
