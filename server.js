require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const getIP = require('express-ip');
const useragent = require('express-useragent');
const cors = require('cors');

const Message = require('./models/Message');
const IPModel = require('./models/ipModel');

const app = express();
app.set('trust proxy', true);
app.use(cors());

app.use(getIP().getIpInfoMiddleware);
app.use(useragent.express());
app.use(express.json());

const mongodbUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME; // Database Name

// Auto-Retry MongoDB Connection Logic
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  
  mongoose.connect(mongodbUri, {
    dbName: dbName, // Database Name
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection failed. Retrying in 5 seconds...', err.message);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

const messagesRouter = require('./routes/messages');
app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('I see you');
});

// Changed to POST to accept body data from frontend
app.post('/log-ip', async (req, res) => {
  // Extract real IP prioritizing Cloudflare headers
  const ip = req.headers['cf-connecting-ip'] || 
             (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) || 
             req.ipInfo.ip || 
             req.ip;

  // Extract page from either body or query fallback, and new screen data
  const page = req.body.page || req.query.page;
  const { screenWidth, screenHeight } = req.body;
  const userAgent = req.useragent;

  try {
    const newIP = new IPModel({
      ipAddress: ip,
      page: page,
      userAgent: userAgent.source,
      operatingSystem: userAgent.os,
      device: userAgent.isMobile ? 'Mobile' : 'Desktop',
      screenWidth: screenWidth || null,
      screenHeight: screenHeight || null,
    });

    await newIP.save();
    console.log(`Saved IP address: ${ip}, Page: ${page}`);

    const ipDocument = await IPModel.findOne({ _id: newIP._id }).exec();

    const response = {
      _id: ipDocument._id,
      ipAddress: ipDocument.ipAddress,
      page: ipDocument.page,
      userAgent: ipDocument.userAgent,
      operatingSystem: ipDocument.operatingSystem,
      device: ipDocument.device,
      screenWidth: ipDocument.screenWidth,
      screenHeight: ipDocument.screenHeight,
      timestamp: ipDocument.timestamp,
      formattedTimestamp: ipDocument.formattedTimestamp,
      __v: ipDocument.__v,
    };

    res.json(response);
  } catch (error) {
    console.error(`Error saving IP address: ${ip}`, error);
    res.status(500).send('Error logging IP address');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const clipboardRouter = require('./routes/clipboard');
app.use('/api/clipboard', clipboardRouter);