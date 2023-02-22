const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');

const consumerSchema = require('../models/consumer')

dotenv.config();
const hash = crypto.getHashes();

const getConfirmationToken = (consumer, isPWReset) => {
  return jwt.sign({ consumerID: consumer._id}, isPWReset? process.env.PW_RESET_SECRET_KEY : process.env.CONFIRMATION_SECRET_KEY, 
    { expiresIn: '15m' });
}

const checkConfirmationToken = async (token, isPWReset) => {
  if(!token)
    throw new Error("Cannot confirm token, token is null");

  const { consumerID } = jwt.verify(token, isPWReset? process.env.PW_RESET_SECRET_KEY : process.env.CONFIRMATION_SECRET_KEY);

  if(!consumerID)
    throw new Error("Cannot confirm token, token might be expired");
     
  return await consumerSchema.findById(consumerID).select('-password');
}

const generateSessionToken = async (consumer) => {
  const timeNow = Date.now();
  await consumerSchema.findByIdAndUpdate(consumer._id, { $set: { lastTokenDate: timeNow } })

  return jwt.sign({ consumerID: consumer._id, tokenDate: timeNow}, process.env.SESSION_SECRET_KEY, { expiresIn: '12h' });
}

const checkConsumerPrototypeAuth = async (req, res, next) => {
  try {
    // Get Token from header
    const { authorization } = req.headers;
    const token = authorization.split(' ')[1];

    if (!authorization || !authorization.startsWith('Bearer'))
     throw new Error("Cannot authenticate consumer, no bearer authorization found");

    if(!token)
     throw new Error("Cannot authenticate consumer, token is null");

    const { consumerID, tokenDate } = jwt.verify(token, process.env.SESSION_SECRET_KEY);

    if(!consumerID)
     throw new Error("Cannot authenticate consumer, token might be expired");
     
    req.consumer = await consumerSchema.findById(consumerID).select('-password');
    next();
    
  } catch (err) {
    // console.log(error);
    res.status(401).send({ "status": "failure", "message": err.message });
  }
}

const checkConsumerConfirmedAuth = async (req, res, next) => {
 
  await checkConsumerPrototypeAuth(req, res, (req, res) => {
    try {
      if(!req.consumer.isEmailConfrimed)
       throw new Error("Cannot authenticate consumer, email is not verrified")

      next();
    } catch (err) {
      // console.log(error);
      res.status(401).send({ "status": "failure", "message": err.message });
    }
  })
 
}

const checkConsumerCompleteAuth = async (req, res, next) => {
  
  await checkConsumerConfirmedAuth(req, res, (req, res) => {
    try {
      if( false ) // TODO: Add condition
        throw new Error("Cannot authenticate consumer, email is not verrified")

      next();
    } catch (err) {
      // console.log(error);
      res.status(401).send({ "status": "failed", "message": err.message });
    }
  })

}

module.exports = {generateSessionToken, getConfirmationToken, checkConfirmationToken, 
  checkConsumerCompleteAuth, checkConsumerConfirmedAuth, checkConsumerPrototypeAuth};