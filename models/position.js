const mongoose = require('mongoose')
const Schema = mongoose.Schema

const positionSchema = new Schema({
    information:{
        title:{
            type: String,
            required: false
        },
        description:{
            type: String,
            required: false
        },
        payRange:{
            type: [Number],
            required: false
        },
        hoursPerWeek:{
            type: [Number],
            required: false
        },
        skills:{
            type: [String],
            required: false
        },
        hoursFlexibility:{
            type: Number,
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
        branchSize:{
            type: Number,
            required: false
        },
        // remove that and add banner picture instead.
        positionPicture:{
            name:{
                type: String,
                required: false
            }
        },
        companyId:{
            type: mongoose.Types.ObjectId,
            required: true
        },
        city:{
            type: String,
            required: false
        },
    },
    settings:{
        acceptMinors:{
            type: Boolean,
            default: false
        },
        location:{
            type: [Number],
            required: false
        },
        fillGoalCount:{
            type: Number,
            required: false
        },
        applicants:[
            {
                user:{
                    type: mongoose.Types.ObjectId,
                    required: false
                },
                time:{
                    type: Date,
                    required: false
                }
            }
        ],
        interviewees:[
            {
                user:{
                    type: mongoose.Types.ObjectId,
                    required: false
                },
                time:{
                    type: Date,
                    required: false
                }
            }
        ],
        employed:[
            {
                user:{
                    type: mongoose.Types.ObjectId,
                    required: false
                },
                time:{
                    type: Date,
                    required: false
                }
            }
        ],
        rejected:[
            {
                user:{
                    type: mongoose.Types.ObjectId,
                    required: false
                },
                time:{
                    type: Date,
                    required: false
                }
            }
        ], 
    },
})

module.exports = mongoose.model('Position', positionSchema)