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
            skills:{
                type: [String],
                required: true
            }
        }
    ],
    profilePicture:{
        name:{
            type: String,
            default: 'default'
        }
    },
    consumerId:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    preferences:{
        maxDistance:{
            type: Number,
            required: false
        },
        skills:{
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
        isInPerson:{
            type: Boolean,
            default: false
        },
        isHybrid:{
            type: Boolean,
            default: false
        },
        isRemote:{
            type: Boolean,
            required: false
        },
        companySize:{
            type: [Number],
            required: false
        },
    },
    status:{
        liked:{
            type: Map,
            of: mongoose.Types.ObjectId,
            default: {}
        },
        interviewing:{
            type: Map,
            of: mongoose.Types.ObjectId,
            default: {}
        },
        rejected:{
            type: Map,
            of: mongoose.Types.ObjectId,
            default: {}
        },
    }
})

module.exports = mongoose.model('UserProfile', userProfileSchema)