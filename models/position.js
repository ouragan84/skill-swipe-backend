const mongoose = require('mongoose')
const Schema = mongoose.Schema

const positionSchema = new Schema({
    information:{
        title:{
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        payRange:{
            type: [Number],
            required: true
        },
        hoursPerWeek:{
            type: [Number],
            required: true
        },
        skills:{
            type: [String],
            required: true
        },
        hoursFlexibility:{
            type: Number,
            required: true
        },
        isInPerson:{
            type: Boolean,
            default: true
        },
        isHybrid:{
            type: Boolean,
            default: true
        },
        isRemote:{
            type: Boolean,
            required: true
        },
        branchSize:{
            type: Number,
            required: true
        },
        companyId:{
            type: mongoose.Types.ObjectId,
            required: true
        },
        city:{
            type: String,
            required: true
        },
    },
    settings:{
        acceptsOver16:{
            type: Boolean,
            default: true
        },
        acceptsOver18:{
            type: Boolean,
            default: true
        },
        acceptsOver21:{
            type: Boolean,
            default: true
        },
        monthsRelevantExperience:{
            type: [Number],
            required: true
        },
        location:{
            type: [Number],
            required: true
        },
        fillGoalCount:{
            type: Number,
            required: true
        },
        skillsImportance:{
            type: [Number],
            required: true
        },
    },
    status:{
        applicants:{
            type: Map,
            of: mongoose.Types.ObjectId,
            default: {}
        },
        interviewees:{
            type: Map,
            of: mongoose.Types.ObjectId,
            default: {}
        },
        employed:{
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

module.exports = mongoose.model('Position', positionSchema)