const { PrismaClient } = require('@prisma/client');

const getAllVideos = async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const data = await prisma.videoData.findMany();
    res.status(200).json(data);
  } catch (err) {
    console.log('error in fetching data: ', err);
    res.status(500).json({ error: err });
  }
};

module.exports = { getAllVideos };
