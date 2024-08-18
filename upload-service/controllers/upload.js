const AWS = require('aws-sdk');
// const fs = require('fs');
const upload1Controller = async (req, res) => {
  console.log('middlware returned');
  if (!req.file) {
    console.log('File not recieved');
    return res.status(400).json({ error: 'File not recieved' });
  }
  const file = req.file;
  console.log('file found, ', file.originalname, file.buffer);
  AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_KEY_SECRET,
  });
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `project/${file.originalname}`,
    Body: file.buffer,
  };
  const s3 = new AWS.S3();
  s3.upload(params, (err, data) => {
    if (err) {
      console.log('Error uploading file:', err);
      res.status(404).json({ error: 'Error in uploading' });
    } else {
      console.log('Uploaded successfully, location:', data.Location);
      res.status(200).json({
        message: 'File uploaded successfully',
        location: data.Location,
      });
    }
  });
};

module.exports = { upload1Controller };
