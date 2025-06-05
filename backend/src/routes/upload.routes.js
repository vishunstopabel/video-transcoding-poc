const express = require("express");
const { router } = express();
const { handleGetSignUrl } = require("../controllers/upload.controller");
router.get("/SignedUrl", handleGetSignUrl);

module.exports = router;
