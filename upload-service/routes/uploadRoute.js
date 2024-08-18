const express = require('express');
const { upload1Controller } = require('../controllers/upload');
const multer = require('multer');
const { multiUploadToS3 } = require('../controllers/multiPartUpload');
const uploader = multer();
const router = express.Router();
router.post('/upload1', uploader.single('file'), upload1Controller);
router.post('/upload2', multiUploadToS3);
router.post(
  '/upload3',
  uploader.fields([
    { name: 'chunk' },
    { name: 'totalChunk' },
    { name: 'chunkIndex' },
  ]),
  upload1Controller
);
module.exports = router;
