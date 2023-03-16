const express = require('express');
const companyProfileService = require('../services/companyProfileService');
const auth = require('../hooks/authMiddleware');

const router = express.Router();

router.use('/set/company-information', auth.checkConsumerConfirmedAuth);
router.post('/set/company-information', companyProfileService.setCompanyInformation);

router.use('/set/industry', auth.checkConsumerConfirmedAuth);
router.post('/set/industry', companyProfileService.setIndustry);

router.use('/set/profile-picture', auth.checkConsumerConfirmedAuth);
router.post('/set/profile-picture', companyProfileService.setProfilePhoto);

// router.use('/get/profile-picture', auth.checkConsumerConfirmedAuth);
// router.get('/get/profile-picture', companyProfileService.getProfilePhoto);

router.use('/add/position', auth.checkConsumerConfirmedAuth);
router.post('/add/position', companyProfileService.addPosition);

router.use('/edit/position', auth.checkConsumerConfirmedAuth);
router.put('/edit/position/:index', companyProfileService.editPosition);

router.use('/delete/position', auth.checkConsumerConfirmedAuth);
router.delete('/delete/position/:index', companyProfileService.deletePosition);

router.use('/set/banner-picture', auth.checkConsumerConfirmedAuth);
router.post('/set/banner-picture', companyProfileService.setBannerPhoto);

// router.use('/get/banner-picture', auth.checkConsumerConfirmedAuth);
// router.get('/get/banner-picture', companyProfileService.getBannerPhoto);

router.use('/check-complete', auth.checkConsumerConfirmedAuth);
router.get('/check-complete', companyProfileService.completeCompany);

router.use('/get/complete-info', auth.checkConsumerConfirmedAuth);
router.get('/get/complete-info', companyProfileService.getCompleteInfo);

router.use('/get/complete-position-info', auth.checkConsumerConfirmedAuth);
router.get('/get/complete-position-info/:index', companyProfileService.getCompletePositionInfo);

router.get('/get/public-info/:id', async (req, res) => {
    try {
        const ret = await companyProfileService.getPublicInfo(req.params.id);
        return res.status(200).json({'status': 'success', 'message':'successfully got info', 'position': ret});
    } catch (err) {
        res.send({'status': 'failure', 'message': err.message});
    }
})

router.get('/get/public-position-info/:id', async (req, res) => {
    try {
        const ret = await companyProfileService.getPublicPositionInfo(req.params.id);
        return res.status(200).json({'status': 'success', 'message':'successfully got position info', 'position': ret});
    } catch (err) {
        res.send({'status': 'failure', 'message': err.message});
    }
})


module.exports = router;