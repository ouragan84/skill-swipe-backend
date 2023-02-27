const express = require('express');
const consumerService = require('../services/consumerService');
const auth = require('../hooks/authMiddleware');

const router = express.Router();

router.post('/register', consumerService.registerConsumer);

router.post('/login', consumerService.loginConsumer);

router.use('/info', auth.checkConsumerPrototypeAuth);
router.get('/info', consumerService.getLoggedConsumer);

router.use('/send/confirmation/email', auth.checkConsumerPrototypeAuth)
router.get('/send/confirmation/email', consumerService.sendEmailConfirmation);

router.get('/confirm/email/:token', consumerService.checkEmailConfirmation);

router.post('/send/passwordreset/code', consumerService.sendPasswordResetCode);

router.post('/check/passwordreset/code', consumerService.checkPasswordResetCode);

router.put('/reset/password', consumerService.resetPassword);

router.use('/delete', auth.checkConsumerPrototypeAuth)
router.delete('/delete', consumerService.deleteConsumer)

// 0 = need email confirm, 1 = need to create account, 2 = good to go
router.use('/is-confirmed', auth.checkConsumerConfirmedAuth);
router.get('/is-confirmed', (req, res) => {return res.status(200).send({"status":"success", "message":"user is confirmed"})});

module.exports = router;