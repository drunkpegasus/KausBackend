require('./keepAlive'); // keepAlive.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const getIP = require('express-ip');
const useragent = require('express-useragent');
const cors = require('cors');

const Message = require('./models/Message');
const IPModel = require('./models/ipModel');

const app = express();
app.use(cors());

app.use(getIP().getIpInfoMiddleware);
app.use(useragent.express());
app.use(express.json());

const mongodbUri = process.env.MONGODB_URI;

mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const messagesRouter = require('./routes/messages');
app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('I see you');
});

app.get('/log-ip', async (req, res) => {
  const ip = req.ipInfo.ip;
  const page = req.query.page;
  const userAgent = req.useragent;

  try {
    const newIP = new IPModel({
      ipAddress: ip,
      page: page,
      userAgent: userAgent.source,
      operatingSystem: userAgent.os,
      device: userAgent.isMobile ? 'Mobile' : 'Desktop',
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
