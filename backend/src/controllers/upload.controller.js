const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getS3client } = require("../utils/aws");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const UploadModel = require("../models/upload.model");

const s3 = getS3client();

module.exports.handleGetSignUrl = async (req, res) => {
  try {
    const { _id } = req.user;
    const { destination, uploadId } = req.query;
    if (!destination || !uploadId) {
      return res.status(400).json({
        message: "Missing required query parameters: destination or uploadId",
      });
    }
    const uuid = crypto.randomUUID();
    const key = `videos/${_id}/${uuid}.mp4`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_TEMP_VIDEO,
      Key: key,
      ContentType: "video/mp4",
      Metadata: {
        destination,
        uploaderid: _id.toString(),
        uploadid: uploadId.toString(),
      },
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return res.status(200).json({
      url,
      key,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return res.status(500).json({
      message: "Failed to generate signed URL",
    });
  }
};

module.exports.createVideo = async (req, res) => {
  try {
    const { _id } = req.user;
    const { title, description, isPublic, duration } = req.body;
    if (
      !title ||
      !description ||
      typeof isPublic === "undefined" ||
      !duration
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    } ///typeof this is good if you are using the boolen values

    const videoDetails = await UploadModel.create({
      title,
      description,
      isPublic,
      duration,
    });
    const basePath = `videos/${_id}/${videoDetails._id}`;
    videoDetails.originalVideoKey = `${basePath}.mp4`;
    videoDetails.originalThumbnailKey = `${basePath}-original-thumbnail.jpg`;
videoDetails.transcodedVideoKey = `${basePath}/master.m3u8`;
    videoDetails.thumbnailKey = `${basePath}-thumbnail.webp`; // Optimized one
    await videoDetails.save();

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_ORIGINAL_TUMBNAIL,
      Key: videoDetails.originalThumbnailKey,
      ContentType: "image/jpeg",
      Metadata: {
        uploaderid: _id.toString(),
        uploadid: videoDetails._id.toString(),
        source: "client",
      },
    });
    const signedImageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return res.status(200).json({
      signedImageUrl,
      key: videoDetails.originalThumbnailKey,
      videoId: videoDetails._id,
    });
  } catch (error) {
    console.error("Error in createVideo:", error);
    return res.status(500).json({
      message: "Failed in creating video",
    });
  }
};
