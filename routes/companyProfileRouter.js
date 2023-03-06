const express = require('express');
const companyProfileService = require('../services/companyProfileService');
const auth = require('../hooks/authMiddleware');

const router = express.Router();

router.use('/set/company-information', auth.checkConsumerConfirmedAuth);
router.post('/set/company-information', companyProfileService.setCompanyInformation);

router.use('/set/profile-picture', auth.checkConsumerConfirmedAuth);
router.post('/set/profile-picture', companyProfileService.setProfilePhoto);

router.use('/get/profile-picture', auth.checkConsumerConfirmedAuth);
router.get('/get/profile-picture', companyProfileService.getProfilePhoto);

router.use('/add/position', auth.checkConsumerConfirmedAuth);
router.post('/add/position', companyProfileService.addPosition);

router.use('/edit/position', auth.checkConsumerConfirmedAuth);
router.put('/edit/position/:index', companyProfileService.editPosition);

router.use('/delete/position', auth.checkConsumerConfirmedAuth);
router.delete('/delete/position/:index', companyProfileService.deletePosition);

router.use('/set/position-picture', auth.checkConsumerConfirmedAuth);
router.post('/set/position-picture/:index', companyProfileService.setPositionPhoto);

router.use('/get/position-picture', auth.checkConsumerConfirmedAuth);
router.get('/get/company-picture/:index', companyProfileService.getPositionPhoto);

router.use('/get/check-complete', auth.checkConsumerConfirmedAuth);
router.get('/get/check-complete', companyProfileService.completeCompany);

router.get('/get/public-info/:id', companyProfileService.getPublicInfo)

router.get('/get/public-position-info/:id', companyProfileService.getPublicPositionInfo)

module.exports = router;