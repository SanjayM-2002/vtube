const AWS = require('aws-sdk');
const fs = require('fs');
const { pushVideoForEncodingToKafka } = require('./kafkaPublisher');
const addVideoDetailsToDb = require('./dbController');

const multiUploadToS3 = async (req, res) => {
  console.log('Starting multi-part upload');

  const filePath = 'D:/PROJECTS/vtube/upload-service/files/introVideo.mp4';
  if (!fs.existsSync(filePath)) {
    console.log('File not found');
    return res.status(400).json({ error: 'File not found' });
  }

  const fileName = filePath.split('/').pop().split('.')[0];
  console.log('File found: ', fileName);

  AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_KEY_SECRET,
  });

  const s3 = new AWS.S3();

  try {
    // Step 1: Initiate the multipart upload
    const createMultipartUploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: `project/${fileName}.mp4`,
    };

    const createMultipartUploadResponse = await s3
      .createMultipartUpload(createMultipartUploadParams)
      .promise();
    const uploadId = createMultipartUploadResponse.UploadId;

    console.log('Multipart upload initiated: ', uploadId);

    // Step 2: Upload parts
    const fileSize = fs.statSync(filePath).size;
    const chunkSize = 5 * 1024 * 1024; // 5 MB
    const numParts = Math.ceil(fileSize / chunkSize);
    const uploadedETags = []; // To store ETags of uploaded parts

    for (let i = 0; i < numParts; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);

      const uploadPartParams = {
        Bucket: createMultipartUploadParams.Bucket,
        Key: createMultipartUploadParams.Key,
        PartNumber: i + 1,
        UploadId: uploadId,
        Body: fs.createReadStream(filePath, { start, end }),
        ContentLength: end - start,
      };

      const uploadPartResponse = await s3
        .uploadPart(uploadPartParams)
        .promise();
      console.log(`Uploaded part ${i + 1}: ${uploadPartResponse.ETag}`);
      uploadedETags.push({
        ETag: uploadPartResponse.ETag,
        PartNumber: i + 1,
      });
    }

    // Step 3: Complete the multipart upload
    const completeMultipartUploadParams = {
      Bucket: createMultipartUploadParams.Bucket,
      Key: createMultipartUploadParams.Key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: uploadedETags,
      },
    };

    const completeMultipartUploadResponse = await s3
      .completeMultipartUpload(completeMultipartUploadParams)
      .promise();
    console.log('Complete response is: ', completeMultipartUploadResponse);
    res.status(200).json({
      message: 'File upload success',
      details: completeMultipartUploadResponse,
    });
  } catch (err) {
    console.log('Error in uploading file: ', err);
    res.status(500).json({ error: err.message });
  }
};

// Initialize upload
const initializeUpload = async (req, res) => {
  try {
    console.log('Initialising Upload');
    const { filename } = req.body;
    console.log(filename);

    const s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.ACCESS_KEY_SECRET,
      region: 'ap-south-1',
    });

    const bucketName = process.env.BUCKET_NAME;

    const createParams = {
      Bucket: bucketName,
      Key: filename,
      ContentType: 'video/mp4',
    };

    const multipartParams = await s3
      .createMultipartUpload(createParams)
      .promise();
    console.log('multipartparams---- ', multipartParams);
    const uploadId = multipartParams.UploadId;

    res.status(200).json({ uploadId });
  } catch (err) {
    console.error('Error initializing upload:', err);
    res.status(500).send('Upload initialization failed');
  }
};

// Upload chunk
const uploadChunk = async (req, res) => {
  try {
    console.log('Uploading Chunk');
    const { filename, chunkIndex, uploadId } = req.body;
    const s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.ACCESS_KEY_SECRET,
      region: 'ap-south-1',
    });
    const bucketName = process.env.BUCKET_NAME;

    const partParams = {
      Bucket: bucketName,
      Key: filename,
      UploadId: uploadId,
      PartNumber: parseInt(chunkIndex) + 1,
      Body: req.file.buffer,
    };

    const data = await s3.uploadPart(partParams).promise();
    console.log('data------- ', data);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error uploading chunk:', err);
    res.status(500).send('Chunk could not be uploaded');
  }
};

// Complete upload
const completeUpload = async (req, res) => {
  try {
    console.log('Completing Upload');
    const { filename, totalChunks, uploadId, title, description, author } =
      req.body;

    const uploadedParts = [];

    // Build uploadedParts array from request body
    for (let i = 0; i < totalChunks; i++) {
      uploadedParts.push({ PartNumber: i + 1, ETag: req.body[`part${i + 1}`] });
    }

    const s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.ACCESS_KEY_SECRET,
      region: 'ap-south-1',
    });
    const bucketName = process.env.BUCKET_NAME;

    const completeParams = {
      Bucket: bucketName,
      Key: filename,
      UploadId: uploadId,
    };

    // Listing parts using promise
    const data = await s3.listParts(completeParams).promise();

    const parts = data.Parts.map((part) => ({
      ETag: part.ETag,
      PartNumber: part.PartNumber,
    }));

    completeParams.MultipartUpload = {
      Parts: parts,
    };

    // Completing multipart upload using promise
    const uploadResult = await s3
      .completeMultipartUpload(completeParams)
      .promise();

    console.log('data----- ', uploadResult);

    await addVideoDetailsToDb(
      title,
      description,
      author,
      uploadResult.Location
    );
    pushVideoForEncodingToKafka(title, uploadResult.Location);
    return res.status(200).json({ message: 'Uploaded successfully!!!' });
  } catch (error) {
    console.log('Error completing upload :', error);
    return res.status(500).send('Upload completion failed');
  }
};

const uploadToDb = async (req, res) => {
  console.log('upload to db req: ', req.body);
  try {
    const videoDetails = req.body;
    const newVideo = await addVideoDetailsToDb(
      videoDetails.title,
      videoDetails.description,
      videoDetails.author,
      videoDetails.url
    );
    return res.status(200).json({ message: 'success', details: newVideo });
  } catch (err) {
    console.log('Error in adding to DB ', err);
    return res.status(400).json({ error: err });
  }
};

module.exports = {
  multiUploadToS3,
  initializeUpload,
  uploadChunk,
  completeUpload,
  uploadToDb,
};
