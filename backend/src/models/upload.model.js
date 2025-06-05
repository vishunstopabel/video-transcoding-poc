const { default: mongoose } = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    originalVideo: {
      type: String,
      required: true,
    },
    originalThumbnailUrl: {
      type: String,
      required: true,
    },
    format: { type: String },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isVideoUploaded: {
      type: Boolean,
      default: false,
    },
    isThumbnailUploaded: {
      type: Boolean,
      default: false,
    },
    transcodedVideoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
    },
    estimatedTimeToTranscode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UploadModel = mongoose.model("Upload", uploadSchema);
module.exports = UploadModel;
