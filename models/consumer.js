// refers to both user and company

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const consumerSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    isTypeUser:{
        type: Boolean,
        required: true
    },
    termsAndConditions:{
        type: Boolean,
        required: true
    },
    dateCreated:{
        type: Date,
        required: true
    },
    isEmailConfrimed:{
        type: Boolean,
        required: true
    },
    lastTokenDate:{
        type: Date,
        required: false
    },
    consumerId:{
        type: mongoose.Types.ObjectId,
        required: false
    },
})

module.exports = mongoose.model('Consumer', consumerSchema)