const express = require("express");
const { handelGithubInit } = require("../controllers/auth.controller");
const { router } = express();
router.get("/github", handelGithubInit);
module.exports = router;
