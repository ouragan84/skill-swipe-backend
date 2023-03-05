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

router.use('/set/profile-picture', auth.checkConsumerConfirmedAuth);
router.post('/set/profile-picture', userProfileService.setProfilePhoto);

router.use('/set/preferences', auth.checkConsumerConfirmedAuth);
router.post('/set/preferences', userProfileService.setPreferences);

router.use('/set/skill-preferences', auth.checkConsumerConfirmedAuth);
router.post('/set/skill-preferences', userProfileService.setSkillPreferences);

router.use('/set/description', auth.checkConsumerConfirmedAuth);
router.post('/set/description', userProfileService.setDescription);

router.use('/get/profile-picture', auth.checkConsumerConfirmedAuth);
router.get('/get/profile-picture/:name', userProfileService.getProfilePhoto);

router.use('/get/check-complete', auth.checkConsumerConfirmedAuth);
router.get('/get/check-complete', userProfileService.completeUser);

module.exports = router;