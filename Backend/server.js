require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const fetchJsonFromFTP = require('./services/ftpService');
const saveToMongo = require('./utils/saveToMongo');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

  /*
// Schedule FTP Fetch
cron.schedule('* * * * *', () => {
  console.log('Running scheduled task to fetch JSON files...');
  fetchJsonFromFTP(saveToMongo);
});
*/
fetchJsonFromFTP(saveToMongo);

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
