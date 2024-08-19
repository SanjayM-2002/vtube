const express = require('express');
const { getAllVideos } = require('../controllers/homeController');
const router = express.Router();
router.get('/getVideos', getAllVideos);
module.exports = router;
