const mongoose = require('mongoose')
const Schema = mongoose.Schema

const logSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    time:{
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Log', logSchema)