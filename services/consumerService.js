const mongoose = require('mongoose');

const consumerSchema = require('../models/consumer');
const {checkPropertyExists} = require('../hooks/propertyCheck');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {sendMail, sendConfirmationEmailTemplate, sendPasswordResetEmailTemplate} = require('../hooks/emailConfig.js')
const auth = require('../hooks/authMiddleware');
const dotenv = require('dotenv');
dotenv.config();

const registerConsumer = async (req, res) => {
    try {
        const { email, isTypeUser, password, termsAndConditions} = req.body;

        checkPropertyExists(email, "email", 'string', "create consumer");
        checkPropertyExists(isTypeUser, "isTypeUser", 'boolean', "create consumer");
        checkPropertyExists(password, "password", 'string', "create consumer");
        checkPropertyExists(termsAndConditions, "termsAndConditions", 'boolean', "create consumer");

        checkEmail(email);
        checkPassword(password);

        const consumerSameEmail = await consumerSchema.findOne({ email: email })

        if (consumerSameEmail)
            throw new Error("Could not create consumer, email adress already in use");

        if (!termsAndConditions)
            throw new Error("Could not create consumer, terms and conditions have not been accepted");

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(`${email}${password}`, salt)
        const doc = new consumerSchema({
            email: email,
            password: hashPassword,
            termsAndConditions: termsAndConditions,
            isTypeUser: isTypeUser,
            dateCreated: Date.now(),
            isEmailConfrimed: false,
            isAccountComplete: false
        })
        await doc.save()
        const consumerPrototype = await consumerSchema.findOne({ email: email })
        // Generate JWT Token
        const token = await auth.generateSessionToken(consumerPrototype);
        res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })

    } catch (err) {
        res.status(400).send({"status": "failure", "message": err.message})
    }
}

const loginConsumer = async (req, res) => {
    try {
        const { email, password } = req.body

        checkPropertyExists(email, "email", 'string', "log in consumer")
        checkPropertyExists(password, "password", 'string', "log in consumer")

        const consumer = await consumerSchema.findOne({ email: email })

        if(!consumer)
            throw new Error("Could not log in consumer, consumer is not registered");

        const isMatch = await bcrypt.compare(`${email}${password}`, consumer.password);

        if (!isMatch)
            throw new Error("Could not log in consumer, Email or Password is not Valid");

        const token = await auth.generateSessionToken(consumer);

        res.status(200).send({ "status": "success", "message": "Login Success", "token": token })

    } catch (err) {
        res.status(400).send({ "status": "failure", "message": err.message })
    }
}

const sendEmailConfirmation = async (req, res) => {
    try {
        const consumerPrototype = req.consumer;
        const confirmation_token = await auth.getConfirmationToken(consumerPrototype);
        const link = `${process.env.OWN_URL}/consumer/confirm/email/${confirmation_token}`
        await sendConfirmationEmailTemplate(consumerPrototype.email, link);
        res.status(200).send({"status": `success`, "message": `Email confirmation sent successfully`});
    } catch (err) {
        res.status(500).send({"status": `failure`, "message": err.message});
    }
}

const checkEmailConfirmation = async (req, res) => {
    try{
        const {token} = req.params;
        if(!token)
            throw new Error("token is null");
        const consumer = await auth.checkConfirmationToken(token, false);
        if (!consumer)
            throw new Error("consumer is null");

        await consumerSchema.findByIdAndUpdate(consumer._id, { $set: { isEmailConfrimed: true } });
        
        res.status(200).send(`Thank you for confirming your email adress! Please check back in the App for the next steps in creating your account.`);
    } catch (err) {
        console.log(err.message);
        res.status(401).send(`Could not Confirm Email Adress, please click on "RESEND CONFIRMATION EMAIL" within the App.`);
    }
}

// request password reset email
const sendPasswordResetCode = async (req, res) => {
    try {
        const {email} = req.body;
        checkPropertyExists(email, "email", "string", "send password reset code");

        const consumer = await consumerSchema.findOne({ email: email })
        if(!consumer)
            throw new Error("Cannot send password reset code, user not found");

        const code = await auth.getPWResetCode(consumer);
        await sendPasswordResetEmailTemplate(email, code);
        res.status(200).send({"status": `success`, "message": `sent password reset code`});
    } catch (err) {
        res.status(400).send({"status": `failure`, "message": err.message});
    }
}

const checkPasswordResetCode = async (req, res) => {
    try {
        const {email, code} = req.body;
        checkPropertyExists(email, "email", "string", "check password reset code");
        checkPropertyExists(code, "email", "string", "check password reset code");

        const consumer = await consumerSchema.findOne({ email: email })
        if(!consumer)
            throw new Error("Cannot check password reset code, user not found");

        const is_correct = await auth.checkPWResetCode(email, code);
        if(!is_correct)
            throw new Error("Cannot check password reset code, code is incorrect");
        
        const token = await auth.getConfirmationToken(consumer, true);
        res.status(200).send({"status": `success`, "message": `password reset code verified`, "token": token});
    } catch (err) {
        res.status(401).send({"status": `failure`, "message": err.message});
    }
}

// actually reset the password
const resetPassword = async (req, res) => {
    try {
        const {password} = req.body;
        checkPropertyExists(password, "password", "string", "reset password");

        const token = await auth.getTokenFromHeader(req.headers);

        const consumer = await auth.checkConfirmationToken(token, true);

        if(!consumer)
            throw new Error("Cannot reset password, error in authorization");

        checkPassword(password);

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(`${consumer.email}${password}`, salt)

        await consumerSchema.findByIdAndUpdate(consumer._id, { $set: { password: hashPassword } })
        res.status(200).send({"status": `success`, "message": `reset password successfully`});
    } catch (err) {
        res.status(401).send({"status": `failure`, "message": err.message});
    }   
}

const checkPassword = (password) => {
    if(password.length < 8)
        throw new Error("Could not Sign Up consumer, password is less than 8 characters");

    if(! /^[\x20-\x7E]*$/.test(password))
        throw new Error("Could not Sign Up consumer, password is not ASCII only");

    if(! /[A-Z]/.test(password))
        throw new Error("Could not Sign Up consumer, password does not have a upper case letter");

    if(! /[a-z]/.test(password))
        throw new Error("Could not Sign Up consumer, password does not have a lower case letter");

    if(! /[0-9]/.test(password))
        throw new Error("Could not Sign Up consumer, password does not have a digit");

    if(! /[^A-Za-z0-9]/.test(password))
        throw new Error("Could not Sign Up consumer, password does not have a special character");
}

const checkEmail = (email) => {
    if(! /^[\x21-\x7E]*$/.test(email) || !email.includes('@') || !email.includes('.'))
        throw new Error("Could not Sign Up consumer, email is not valid");
}

const getLoggedConsumer = async (req, res) => {
    res.status(200).send({ "consumer": req.consumer })
}

const deleteConsumer = async (req, res) => {
    try {
        await Test.deleteOne({ _id: req.consumer._id });
        res.status(200).send({"status": "success", "message": "deleted consumer successfully"});
    } catch (err) {
        res.status(400).send({"status": "success", "message": err.message});
    }
}

module.exports = {registerConsumer, loginConsumer, getLoggedConsumer, checkEmailConfirmation, 
    sendEmailConfirmation, sendPasswordResetCode, resetPassword, checkPasswordResetCode, deleteConsumer};