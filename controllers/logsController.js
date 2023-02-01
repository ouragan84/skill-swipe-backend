const mongoose = require('mongoose');
// const DB_HOST = "127.0.0.1"
// const DB_PORT = "27017"
// const DB_NAME = "logs-test"
// const DB_OPTIONS = "?directConnection=true&serverSelectionTimeoutMS=2000"

//db.createUser({user:"user",pwd:"password",roles:[]})

const DB_URL = 'mongodb://user:password@127.0.0.1:27017/logs-test'

const Logs = require('../models/log')

const connectDB = async () => {
    try{
        await mongoose.connect(DB_URL, {
            
        });
    }catch (err){
        console.error(err);
    }
}

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


module.exports = {connectDB, handleLog, findLogByTitle, getAllLogs, getLogNumber}
