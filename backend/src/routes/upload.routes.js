const express = require("express");
const { router } = express();
const {
  handleGetSignUrl,
  createVideo,
  handleUpdateVideoUploadStatus
} = require("../controllers/upload.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
router.get("/SignedUrl", isAuthenticated,handleGetSignUrl);
router.post("/createVideo", isAuthenticated, createVideo);
router.put("/updateVideoStatus", isAuthenticated, handleUpdateVideoUploadStatus);
module.exports = router;
