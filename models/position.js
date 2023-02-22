const mongoose = require('mongoose')
const Schema = mongoose.Schema

const positionSchema = new Schema({
    poop:{
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Position', positionSchema)