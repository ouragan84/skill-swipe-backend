const mongoose = require('mongoose');

const Logs = require('../models/log');

const handleLog = async (req, res) => {
    const {message, title} = req.body;
    if(!message || !title) return res.status(400).json({'message':'Error creating Log'});
    time = Date.now();

    const result = await Logs.create({
        'title':title,
        'message':message,
        'time':time
    });

    console.log("created log record " + result);

    return res.status(201).json({'message':'Success creating Log'});
}

const findLogByTitle = async (title) => {
    return await Logs.findOne({title:title}).exec();
} 

const getAllLogs = async () => {
    return await Logs.find({});
} 

const getLogNumber = async () => {
    return await Logs.count();
} 


module.exports = {handleLog, findLogByTitle, getAllLogs, getLogNumber}
