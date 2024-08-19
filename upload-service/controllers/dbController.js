const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const addVideoDetailsToDb = async (title, description, author, url) => {
  console.log('add video details to db');
  try {
    const newVideo = await prisma.videoData.create({
      data: {
        title: title,
        description: description,
        author: author,
        url: url,
      },
    });
    console.log('video details: ', newVideo);
    return newVideo;
  } catch (err) {
    console.error('Error adding video details:', err);
    return;
  }
};

module.exports = addVideoDetailsToDb;
