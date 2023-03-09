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
            default: 'default'
        }
    },
    bannerPicture:{
        name:{
            type: String,
            default: 'default'
        }
    },
    positions:{
        type: [mongoose.Types.ObjectId],
        default: []
    },
    consumerId:{
        type: mongoose.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('CompanyProfile', companyProfileSchema)