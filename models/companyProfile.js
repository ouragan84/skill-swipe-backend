const mongoose = require('mongoose')
const Schema = mongoose.Schema

const companyProfileSchema = new Schema({
    name:{
        type: String,
        required: false
    },
    description:{
        type: String,
        required: false
    },
    size:{
        type: Number,
        required: false
    },
    industry:{
        type: String,
        required: false
    },
    profilePicture:{
        name:{
            type: String,
            required: false
        }
    },
    positions:{
        type: [mongoose.Types.ObjectId],
        required: false
    },
    consumerId:{
        type: mongoose.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('CompanyProfile', companyProfileSchema)