const express = require('express');
const consumerService = require('../services/consumerService');
const auth = require('../hooks/authMiddleware');

const router = express.Router();

// ROute Level Middleware - To Protect Route

// // Public Routes
// router.post('/register', ConsumerService.ConsumerRegistration)
// router.post('/login', ConsumerService.ConsumerLogin)
// router.post('/send-reset-password-email', ConsumerService.sendConsumerPasswordResetEmail)
// router.post('/reset-password/:id/:token', ConsumerService.ConsumerPasswordReset)

// // Protected Routes
// router.post('/changepassword', ConsumerService.changeConsumerPassword)
// router.get('/loggeduser', ConsumerService.loggedConsumer)


router.post('/register', consumerService.registerConsumer);
router.post('/login', consumerService.loginConsumer);

router.use('/info', auth.checkConsumerPrototypeAuth);
router.get('/info', consumerService.getLoggedConsumer);

router.get('/confirm/email/:token', consumerService.checkEmailConfirmation);




module.exports = router;