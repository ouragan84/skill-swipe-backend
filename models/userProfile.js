const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userProfileSchema = new Schema({

    personalInformation:{
        firstName:{
            type: String,
            required: false
        },
        lastName:{
            type: String,
            required: false
        },
        DOB:{
            type: Date,
            required: false
        },
        location:{
            type: [Number],
            required: false
        },
        city:{
            type: String,
            required: false
        },
        description:{
            type: String,
            required: false
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
            isCurrent:{
                type: Boolean,
                required: true
            },
            skill:{
                type: [String],
                required: true
            }
        }
    ],
    profilePictureURL:{
        type: String,
        required: false
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

module.exports = mongoose.model('UserProfile', userProfileSchema)