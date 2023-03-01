const express = require('express');
const userProfileService = require('../services/userProfileService');
const auth = require('../hooks/authMiddleware');

const router = express.Router();

router.use('/set/personal-info', auth.checkConsumerConfirmedAuth);
router.post('/set/personal-info', userProfileService.setUserPersonalInformation);

router.use('/add/experience', auth.checkConsumerConfirmedAuth);
router.post('/add/experience', userProfileService.addExperience);

router.use('/set/location', auth.checkConsumerConfirmedAuth);
router.post('/set/location', userProfileService.setLocation);

module.exports = router;