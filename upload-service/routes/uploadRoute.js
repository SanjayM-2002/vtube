const express = require('express');
const { upload1Controller } = require('../controllers/upload');
const multer = require('multer');
const uploader = multer();
const router = express.Router();
router.post('/upload1', uploader.single('file'), upload1Controller);
module.exports = router;
