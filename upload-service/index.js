console.log('hello world');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const uploadRoute = require('./routes/uploadRoute');
const kafkaPublisherRoute = require('./routes/kafkaPublisherRoute');
const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
  console.log('hello');
  res.status(200).json({ message: 'Health check success' });
});
app.use('/uploads', uploadRoute);
app.use('/publish', kafkaPublisherRoute);
app.listen(PORT, () => {
  console.log(`upload-service is listening on http://localhost:${PORT}/`);
});
