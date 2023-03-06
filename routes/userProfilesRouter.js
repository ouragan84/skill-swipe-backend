const express = require('express');
const userProfileService = require('../services/userProfileService');
const auth = require('../hooks/authMiddleware');

const router = express.Router();

router.use('/set/personal-info', auth.checkConsumerConfirmedAuth);
router.post('/set/personal-info', userProfileService.setUserPersonalInformation);

router.use('/add/experience', auth.checkConsumerConfirmedAuth);
router.post('/add/experience', userProfileService.addExperience);

router.use('/edit/experience', auth.checkConsumerConfirmedAuth);
router.put('/edit/experience/:index', userProfileService.editExperience);

router.use('/delete/experience', auth.checkConsumerConfirmedAuth);
router.delete('/delete/experience/:index', userProfileService.deleteExperience);

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
router.get('/get/profile-picture', userProfileService.getProfilePhoto);

router.use('/check-complete', auth.checkConsumerConfirmedAuth);
router.get('/check-complete', userProfileService.completeUser);

router.get('/get/public-info/:id', userProfileService.getPublicInfo)

module.exports = router;