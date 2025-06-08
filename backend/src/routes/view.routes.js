const express = require('express');
const { handleGetAllVideosByUser, handleGetVideoById } = require('../controllers/view.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const router = express.Router();
router.get('/getall-videos-by-user', isAuthenticated, handleGetAllVideosByUser);
router.get('/get-video-by-id/:videoId', isAuthenticated, handleGetVideoById);
module.exports = router;