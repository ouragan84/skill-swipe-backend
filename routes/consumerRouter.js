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

router.get('/send/passwordreset/code', consumerService.sendPasswordResetCode);

router.post('/check/passwordreset/code', consumerService.checkPasswordResetCode);

router.put('/reset/password', consumerService.resetPassword);

router.use('/delete', auth.checkConsumerPrototypeAuth)
router.delete('/delete', consumerService.deleteConsumer)


module.exports = router;