const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const UploadModel = require("../models/upload.model");

const getSignedUrlForThumbnail = (key) => {
  console.log("Generating signed URL for thumbnail:", key);
  console.log("CloudFront Domain:", process.env.AWS_BUCKET_CLOUD_FRONT_DOMAIN);
  console.log("Private Key:", process.env.AWS_CLOUD_FRONT_PRIVATE_KEY);
  console.log("Key Pair ID:", process.env.AWS_CLOUD_FRONT_KEYPAIR_ID);
  return getSignedUrl({
    url: `${process.env.AWS_BUCKET_CLOUD_FRONT_DOMAIN}/${key}`,
    dateLessThan: new Date(Date.now() + 3600 * 1000),
    privateKey: process.env.AWS_CLOUD_FRONT_PRIVATE_KEY.replace(/\\n/g, '\n'), 
    keyPairId: process.env.AWS_CLOUD_FRONT_KEYPAIR_ID,
  }); 
  // return `${process.env.AWS_BUCKET_CLOUD_FRONT_DOMAIN}/${key}`; ///// if you dont want to use signed url
};

module.exports.handleGetAllVideosByUser = async (req, res) => {
  try {
    const _id = "683eef4801c10ff00acefa85";
    const videos = await UploadModel.find({ uploadedBy: _id }).sort({
      createdAt: -1,
    });
    if (!videos || videos.length === 0) {
      return res.status(404).json({ message: "No videos found for this user" });
    }
    const signedVideos = await Promise.all(
      videos.map(async (video) => {
        const signedUrl = getSignedUrlForThumbnail(video.thumbnailKey);
        console.log("Signed URL for video:", signedUrl);
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
