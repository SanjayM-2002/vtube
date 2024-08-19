const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const addVideoDetailsToDb = async (req, res) => {
  const { title, description, author, url } = req.body;
  try {
    const newVideo = await prisma.videoData.create({
      data: {
        title: title,
        description: description,
        author: author,
        url: url,
      },
    });
    res.status(201).json(newVideo);
  } catch (err) {
    console.error('Error adding video details:', err);
    res
      .status(500)
      .json({ error: 'Failed to add video details to the database' });
  }
};

module.exports = addVideoDetailsToDb;
