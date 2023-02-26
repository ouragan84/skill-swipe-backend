const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');

const consumerSchema = require('../models/consumer')

dotenv.config();
const hash = crypto.getHashes();

const getConfirmationToken = (consumer, isPWReset) => {
  return jwt.sign({consumerID: consumer._id}, isPWReset? process.env.PW_RESET_SECRET_KEY : process.env.CONFIRMATION_SECRET_KEY, 
    { expiresIn: '15m' });
}

const checkConfirmationToken = async (token, isPWReset) => {
  if(!token)
    throw new Error("Cannot confirm token, token is null");

  const { consumerID } = jwt.verify(token, isPWReset? process.env.PW_RESET_SECRET_KEY : process.env.CONFIRMATION_SECRET_KEY);

  const consumer = await consumerSchema.findById(consumerID).select('-password');
  
  if(!consumer)
    throw new Error("Cannot confirm token, consumer not found");

  return consumer
}

const getPWResetCode = async (consumer) => {
  const timeNow = Date(Date.now());
  await consumerSchema.findByIdAndUpdate(consumer._id, { $set: { lastTokenDate: timeNow } });

  const hash = crypto.createHash('sha256').update(`${consumer._id}${timeNow}${process.env.PW_RESET_CODE_SECRET_KEY}`).digest('hex');
  const code = (Number(`0x${hash}`)%1e6).toString().padStart(6, '0');

  return code;
}

const checkPWResetCode = async (email, code) => {
  if(!email)
    throw new Error("Cannot confirm code, email is null");
  if(!code)
    throw new Error("Cannot confirm code, code is null");

  const consumer = await consumerSchema.findOne({email: email});
  
  if(!consumer)
    throw new Error("Cannot confirm code, consumer not found");

  if(Date.now() - Date(consumer.lastTokenDate) > 900)
    throw new Error("Cannot confirm code, code was sent too long ago, try resending the code");

  const hash = crypto.createHash('sha256').update(`${consumer._id}${consumer.lastTokenDate}${process.env.PW_RESET_CODE_SECRET_KEY}`).digest('hex');
  const code_verify = (Number(`0x${hash}`)%1e6).toString().padStart(6, '0');

  if(code_verify != code)
    throw new Error(`Code is incorrect, please request a new code`);

  return true;
}

const generateSessionToken = async (consumer) => {
  const timeNow = Date.now();
  await consumerSchema.findByIdAndUpdate(consumer._id, { $set: { lastTokenDate: timeNow } })

  return jwt.sign({ consumerID: consumer._id, tokenDate: timeNow}, process.env.SESSION_SECRET_KEY, { expiresIn: '10m' });
}

const getTokenFromHeader = async (headers) => {
  const { authorization } = headers;
  const token = authorization.split(' ')[1];

  if (!authorization || !authorization.startsWith('Bearer'))
   throw new Error("Cannot authenticate consumer, no bearer authorization found");

  if(!token)
   throw new Error("Cannot authenticate consumer, token is null");

  return token;
}

const getConsumerFromSessionToken = async (headers) => {
  // Get Token from header
  const token = await getTokenFromHeader(headers);

  const { consumerID, tokenDate } = jwt.verify(token, process.env.SESSION_SECRET_KEY);

  const consumer = await consumerSchema.findById(consumerID).select('-password');
  
  if(!consumer)
    throw new Error("Cannot confirm token, consumer not found");
 
  return consumer
}

const checkConsumerPrototypeAuth = async (req, res, next) => {
  try {
    req.consumer = await getConsumerFromSessionToken(req.headers);
    
    next();
    
  } catch (err) {
    // console.log(error);
    if(err.message == "jwt expired")
      res.status(401).send({ "status": "failure", "message": "token expired", "token_expired":true });
    else
      res.status(401).send({ "status": "failure", "message": err.message });
  }
}

const checkConsumerConfirmedAuth = async (req, res, next) => {
  try {
    req.consumer = await getConsumerFromSessionToken(req.headers);

    if(!req.consumer.isEmailConfrimed)
     throw new Error("Cannot authenticate consumer, email is not verrified")

    next();
  } catch (err) {
    if(err.message == "jwt expired")
      res.status(401).send({ "status": "failure", "message": "token expired", "token_expired":true });
    else
      res.status(401).send({ "status": "failure", "message": err.message });  }
}

const checkConsumerCompleteAuth = async (req, res, next) => {
  try {
    req.consumer = await getConsumerFromSessionToken(req.headers);

    if(!req.consumer.isEmailConfrimed)
      throw new Error("Cannot authenticate consumer, email is not verrified")

    if(!req.consumer.isAccountComplete)
      throw new Error("Cannot authenticate consumer, email is not verrified")

    next();
  } catch (err) {
    if(err.message == "jwt expired")
      res.status(401).send({ "status": "failure", "message": "token expired", "token_expired":true });
    else
      res.status(401).send({ "status": "failure", "message": err.message });
  }
}

module.exports = {generateSessionToken, getConfirmationToken, checkConfirmationToken, 
  checkConsumerCompleteAuth, checkConsumerConfirmedAuth, checkConsumerPrototypeAuth,
  getPWResetCode, checkPWResetCode, getTokenFromHeader};