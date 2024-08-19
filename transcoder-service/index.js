console.log('transcoder-service up');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Health check success' });
});

app.listen(PORT, () => {
  console.log(`transcoder-service is listening on http://localhost:${PORT}/`);
});
