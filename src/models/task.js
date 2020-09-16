const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
        trim: true
    },
    // description: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    time: {
        type: Date,
        default: Date.now()        
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', userSchema)

module.exports = Task