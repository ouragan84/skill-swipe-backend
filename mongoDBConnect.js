const mongoose = require('mongoose');
require('dotenv').config()

const DB_NAME = "logs-test";
const DB_URL = "mongodb+srv://"+process.env.MONGO_USERNAME+":"+process.env.MONGO_PASSWORD+
    "@"+process.env.MONGO_URL+"/"+DB_NAME+"?retryWrites=true&w=majority";

    
const connectDB = async () => {
    mongoose.set('strictQuery', false);
    
    try{
        await mongoose.connect(DB_URL, {
            
        });
    }catch (err){
        console.error(err);
    }
}

module.exports = {connectDB}