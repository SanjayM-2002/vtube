const express = require('express');
const { upload1Controller } = require('../controllers/upload');
const multer = require('multer');
const {
  multiUploadToS3,
  initializeUpload,
  uploadChunk,
  completeUpload,
  uploadToDb,
} = require('../controllers/multiPartUpload');
const addVideoDetailsToDb = require('../controllers/dbController');
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
// Route for initializing upload
router.post('/initialize', uploader.none(), initializeUpload);
// Route for uploading individual chunks
router.post('/', uploader.single('chunk'), uploadChunk);
// Route for completing the upload
router.post('/complete', completeUpload);
//Route for testing uploadToDb api
router.post('/uploadToDb', uploadToDb);
module.exports = router;
