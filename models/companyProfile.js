const mongoose = require('mongoose')
const Schema = mongoose.Schema

const companyProfileSchema = new Schema({

    personalInformation:{
        firstName:{
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        },
        DOB:{
            type: Date,
            required: true
        },
        location:{
            type: [Number],
            required: true
        },
        city:{
            type: String,
            required: false
        },
        description:{
            type: String,
            required: true
        },
    },

    experience:[
        {
            title:{
                type: String,
                required: true
            },
            description:{
                type: String,
                required: true
            },
            months:{
                type: Number,
                required: true
            },
            isEducation:{
                type: Boolean,
                required: true
            },
            isPresent:{
                type: Boolean,
                required: true
            },
            tags:{
                type: [String],
                required: true
            }
        }
    ],
    profilePictureURL:{
        type: String,
        required: true
    },
    dateCreated:{
        type: Date,
        required: true
    },
    dateLastModified:{
        type: Date,
        required: true
    },
    interests:{
        maxDistance:{
            type: Number,
            required: false
        },
        tags:{
            type: [String],
            required: false
        },
        hoursPerWeek:{
            type: [Number],
            required: false
        },
        hoursFlexibility:{
            type: [Number],
            required: false
        },
        isRemoteOnly:{
            type: Boolean,
            default: false
        },
        isRemoteOnly:{
            type: Boolean,
            required: false
        },
        companySize:{
            type: [Number],
            required: false
        },
    }
})

module.exports = mongoose.model('CompanyProfile', companyProfileSchema)