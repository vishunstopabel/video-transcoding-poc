const UploadModel = require("../models/upload.model");
const { getSignedUrlForThumbnail } = require("../utils/aws");
module.exports.handleGetAllVideosByUser = async (req, res) => {
  try {
    const {_id} = req.user;
    const videos = await UploadModel.find({ uploadedBy: _id }).sort({
      createdAt: -1,
    });
    if (!videos || videos.length === 0) {
      return res.status(404).json({ message: "No videos found for this user" });
    }
    const signedVideos = await Promise.all(
      videos.map(async (video) => {
        const signedUrl = getSignedUrlForThumbnail(video.thumbnailKey);

        video.thumbnailKey = signedUrl;
        return video;
      })
    );
    const completedVideos = signedVideos.filter(
      (video) => video.status === "completed"
    );
    const incompleteVideos = signedVideos.filter(
      (video) => video.status !== "completed"
    );
    return res.status(200).json({ completedVideos, incompleteVideos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({ message: "Failed to fetch videos" });
  }
};


module.exports.handleGetVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }
    const video = await UploadModel.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const signedUrl = getSignedUrlForThumbnail(video.thumbnailKey);
    video.thumbnailKey = signedUrl;
    return res.status(200).json(video);
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    return res.status(500).json({ message: "Failed to fetch video" });
  }
};
