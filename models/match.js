const mongoose = require('mongoose')
const Schema = mongoose.Schema

const matchSchema = new Schema({
    poop:{
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Match', matchSchema)