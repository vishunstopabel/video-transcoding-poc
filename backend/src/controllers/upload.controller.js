const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getS3client } = require("../utils/aws");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const UploadModel = require("../models/upload.model");

const s3 = getS3client();

module.exports.handleGetSignUrl = async (req, res) => {
  try {
    const { _id } = req.user;
    const { uploadId } = req.query;
    if (!uploadId) {
      return res.status(400).json({
        message: "Missing required query parameters: uploadId",
      });
    }
    const key = `videos/${_id}/${uploadId}.mp4`;
    console.log("Generated key for S3:", key);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_ORIGINAL_VIDEO,
      Key: key,
      ContentType: "video/mp4",
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
    const { title, description, isPublic, ContentType } = req.body;
    if (!title || !description || typeof isPublic === "undefined") {
      return res.status(400).json({ message: "Missing required fields" });
    } ///typeof this is good if you are using the boolen values

    const videoDetails = await UploadModel.create({
      uploadedBy: _id,
      title,
      description,
      isPublic,
    });
    const basePath = `videos/${_id}/${videoDetails._id}`;
    videoDetails.originalVideoKey = `${basePath}.mp4`;
    videoDetails.originalThumbnailKey = `${basePath}-original-thumbnail.jpg`;
    videoDetails.transcodedVideoKey = `${basePath}/master.m3u8`;
    videoDetails.thumbnailKey = `${basePath}-optimized-thumbnail.webp`;
    await videoDetails.save();
    console.log("Video details saved:", videoDetails.originalThumbnailKey);
    console.log(process.env.AWS_BUCKET_ORIGINAL_TUMBNAIL);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_ORIGINAL_TUMBNAIL,
      Key: videoDetails.originalThumbnailKey,
      ContentType: ContentType,
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


module.exports.handleUpdateVideoUploadStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const video = await UploadModel.findOneAndUpdate(
      { _id: videoId, uploadedBy: _id },
      { isVideoUploaded: true, isThumbnailUploaded: true },
      { new: true }
    );
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    return res.status(200).json({ message: "Video status updated", video });
  } catch (error) {
    console.error("Error updating video status:", error);
    return res.status(500).json({ message: "Failed to update video status" });
  }
}