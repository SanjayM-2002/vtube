console.log('hello world');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const uploadRoute = require('./routes/uploadRoute');
const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(cors());

app.get('/health', (req, res) => {
  console.log('hello');
  res.status(200).json({ message: 'Health check success' });
});
app.use('/uploads', uploadRoute);
app.listen(PORT, () => {
  console.log(`upload-service is listening on http://localhost:${PORT}/`);
});
