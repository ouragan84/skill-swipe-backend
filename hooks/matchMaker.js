const userProfileSchema = require('../models/userProfile');
const positionSchema = require('../models/position');
const consumerSchema = require('../models/consumer');
const companyProfileSchema = require('../models/companyProfile');

const getRandomPosition = async () => {
    const count = await positionSchema.count();
    const random = Math.floor(Math.random() * count);
    return await positionSchema.findOne().skip(random);
}