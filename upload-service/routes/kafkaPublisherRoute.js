const express = require('express');
const { sendMessageToKafka } = require('../controllers/kafkaPublisher');

const router = express.Router();
router.post('/', sendMessageToKafka);
module.exports = router;
