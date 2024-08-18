const AWS = require('aws-sdk');
const fs = require('fs');

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

module.exports = { multiUploadToS3 };
