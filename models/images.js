const mongoose = require('mongoose')
const Schema = mongoose.Schema

const imageSchema = new Schema({

    uid:{
        type: String,
        required: true
    },
    images: [
    {
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: false
        },
    }
    ]
})

module.exports = mongoose.model('Image', imageSchema)