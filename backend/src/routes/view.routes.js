const express = require('express');
const { handleGetAllVideosByUser } = require('../controllers/view.controller');
const router = express.Router();
router.get('/getall-videos-by-user', handleGetAllVideosByUser);
module.exports = router;