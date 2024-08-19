console.log('hello world');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const watchRoute = require('./routes/watchRoute');

const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use('/watch', watchRoute);
app.get('/health', (req, res) => {
  console.log('hello');
  res.status(200).json({ message: 'Health check success' });
});

app.listen(PORT, () => {
  console.log(`upload-service is listening on http://localhost:${PORT}/`);
});
