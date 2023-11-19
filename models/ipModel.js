const mongoose = require('mongoose');

const ipSchema = new mongoose.Schema({
  ipAddress: String,
  page: String,
  userAgent: String,
  operatingSystem: String,
  device: String,
  timestamp: { type: Date, default: Date.now },
  formattedTimestamp: String,
  accessDay: String,
  accessTime: String,
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
  const accessDay = indianTimestamp.toLocaleDateString('en-US', { weekday: 'long' });

  this.accessDay = accessDay;
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
  const monthNumber = dateParts[1];
  const year = dateParts[0];

  const accessDay = getaccessDay(new Date(formattedDate));

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthName = monthNames[parseInt(monthNumber, 10) - 1];

  // Formatting to 12-hour format
  const hours = parseInt(time.substring(0, 2), 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;

  const separator = ' | ';

  const accessTime = `${formattedHours}:${time.substring(3)} ${ampm}${separator}${day}-${monthName}-${year}${separator}${accessDay}`;
  return accessTime;
}



function getaccessDay(date) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return daysOfWeek[date.getDay()];
}



module.exports = mongoose.model('IP', ipSchema);
