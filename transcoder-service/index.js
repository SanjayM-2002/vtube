console.log('transcoder-service up');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { convertToHLS } = require('./controllers/transcode');
const { KafkaConfig } = require('./kafka/kafka');
const { s3ToS3 } = require('./controllers/s3ToS3');
dotenv.config();
const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

// const kafkaConfig = new KafkaConfig();
// kafkaConfig.consume('transcode', (value) => {
//   console.log('Got data from kafka : ', value);
// });

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Health check success' });
});

app.get('/transcode', (req, res) => {
  try {
    s3ToS3();
    res.status(200).json({ message: 'Transcoding done' });
  } catch (err) {
    console.log('error in transcoding: ', err);
    res.status(500).json({ error: 'error in transcoding' });
  }
});

app.get('/testTranscode', (req, res) => {
  try {
    convertToHLS();
    res.status(200).json({ message: 'Test Transcoding done' });
  } catch (err) {
    console.log('error in test transcoding: ', err);
    res.status(500).json({ error: 'error in test transcoding' });
  }
});

app.listen(PORT, () => {
  console.log(`transcoder-service is listening on http://localhost:${PORT}/`);
});
