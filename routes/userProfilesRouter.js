const express = require('express');
const userProfileService = require('../services/userProfileService');

const router = express.Router();

router.post('/create', userProfileService.createUser);

module.exports = router;