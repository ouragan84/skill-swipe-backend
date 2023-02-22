const mongoose = require('mongoose');

const consumerSchema = require('../models/consumer');
const {checkPropertyExists} = require('../hooks/propertyCheck');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {sendMail, sendConfirmationEmailTemplate} = require('../hooks/emailConfig.js')
const auth = require('../hooks/authMiddleware');
const dotenv = require('dotenv');
dotenv.config();

// call to create 
// const createConsumer = async (req, res) => {
//     try{
//         const {consumer} = req.body;
//         checkPropertyExists(consumer, "userSignUp", Object);
//         checkPropertyExists(consumer.username, "username", String);
//         checkPropertyExists(consumer.password, "password", String);
//         checkPropertyExists(consumer.isTypeUser, "isTypeUser", Boolean);

//         const exists = await consumerSchema.exists({ username: consumer.username });

//         if(exists)
//             throw new Error("Could not Sign Up consumer, username " + consumer.username + " is already taken");

//         if(consumer.password.length < 8)
//             throw new Error("Could not Sign Up consumer, password is less than 8 characters");
        
//         if(! /^[\x21-\x7E]$/.test(consumer.username))
//             throw new Error("Could not Sign Up consumer, username is not ASCII only");

//         if(! /^[\x21-\x7E]$/.test(consumer.password))
//             throw new Error("Could not Sign Up consumer, password is not ASCII only");

//         if(! /[A-Z]/.test(consumer.password))
//             throw new Error("Could not Sign Up consumer, password does not have a upper case letter");

//         if(! /[a-z]/.test(consumer.password))
//             throw new Error("Could not Sign Up consumer, password does not have a lower case letter");

//         if(! /[0-9]/.test(consumer.password))
//             throw new Error("Could not Sign Up consumer, password does not have a digit");

//         if(! /^[A-Za-z0-9]/.test(consumer.password))
//             throw new Error("Could not Sign Up consumer, password does not have a special character");

//         return res.send(saveConsumer(consumer));
            
//     }catch (error){
//         res.status(400).json({'message':error.message});
//     }
// } 

// const saveConsumer = (consumer) => {
//     bcrypt.genSalt(10, function (err, salt) {
// 		if (err)
//             throw new Error("Problem while hashing new consumer password");

// 		bcrypt.hash(consumer.password, salt, function (err, hash) {
// 			if (err) return next(err);
			
// 			const newConsumer = new consumerSchema({
// 				username: consumer.username,
// 				password: hash,
//                 isTypeUser: consumer.isTypeUser
// 			});

// 			return newConsumer.save();
// 		});
// 	});
// }

const registerConsumer = async (req, res) => {
    try {
        const { email, isTypeUser, password, password_confirmation, termsAndConditions} = req.body;

        checkPropertyExists(email, "email", 'string', "create consumer");
        checkPropertyExists(isTypeUser, "isTypeUser", 'boolean', "create consumer");
        checkPropertyExists(password, "password", 'string', "create consumer");
        checkPropertyExists(password_confirmation, "password_confirmation", 'string', "create consumer");
        checkPropertyExists(termsAndConditions, "termsAndConditions", 'boolean', "create consumer");

        const consumerSameEmail = await consumerSchema.findOne({ email: email })

        if (consumerSameEmail)
            throw new Error("Could not create consumer, email adress already in use");

        if (password != password_confirmation)
            throw new Error("Could not create consumer, password and password confirmation did not match");

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
            isEmailConfrimed: false
        })
        await doc.save()
        const consumerPrototype = await consumerSchema.findOne({ email: email })
        // Generate JWT Token
        const token = await auth.generateSessionToken(consumerPrototype);

        // console.log(token);

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

        sendEmailConfirmation(consumer);

        res.status(200).send({ "status": "success", "message": "Login Success", "token": token })

    } catch (err) {
        res.status(400).send({ "status": "failure", "message": err.message })
    }
}

const sendEmailConfirmation = async (consumerPrototype) => {
    const confirmation_token = await auth.getConfirmationToken(consumerPrototype);
    const link = `${process.env.OWN_URL}/consumer/confirm/email/${confirmation_token}`
    sendConfirmationEmailTemplate(consumerPrototype.email, link);
}

const checkEmailConfirmation = async (req, res) => {
    try{
        const {token} = req.params;
        if(!token)
            throw new Error("1");
        const consumer = await auth.checkConfirmationToken(token, false);
        if (!consumer)
            throw new Error("2");

        await consumerSchema.findByIdAndUpdate(consumer._id, { $set: { isEmailConfrimed: true } });
        
        res.status(200).send(`Thank you for confirming your email adress! Please check back in the App for the next steps in creating your account.`);
    } catch (err) {
        console.log(err.message);
        res.status(401).send(`Could not Confirm Email Adress, please click on "RESEND CONFIRMATION EMAIL" within the App.`);
    }
}

const getLoggedConsumer = async (req, res) => {
    res.status(200).send({ "consumer": req.consumer })
}


module.exports = {registerConsumer, loginConsumer, getLoggedConsumer, checkEmailConfirmation};