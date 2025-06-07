const express = require("express");
const { router } = express();
const {
  handleGetSignUrl,
  createVideo,
} = require("../controllers/upload.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
router.get("/SignedUrl", isAuthenticated,handleGetSignUrl);
router.post("/createVideo", isAuthenticated, createVideo);
module.exports = router;
