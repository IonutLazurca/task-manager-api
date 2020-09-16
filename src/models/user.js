const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const keyEncryption = process.env.TOKEN_ENCRYPTION_KEY
const expiration = {
    expiresIn: '2 days'
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,        
    },
    email: {    
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase:true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        // minlength: [6, 'Password min length 6 characters'],
        // maxlength: [12, 'Password max size 12 characters'],
        validate(value) {
            if (value.toLowerCase().includes('Password')) {
                throw new Error('Password must not contain password string')
            }
        }
    },
    age: {
        type: Number,
        trim: true,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be higher than 0')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer,        
    }
}, {
    timestamps: true
})

//hash the plain password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8) 
    }
    next()
})

userSchema.pre('remove', async function(next) {

    await Task.deleteMany({owner: this._id})
    next()
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//generate token
userSchema.methods.generateAuthToken = async function () {
    
    const token = jwt.sign({_id: this._id.toString(), name: this.name}, keyEncryption, expiration)
    
    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
}

//get public information with restriction by overwriting toJSON method which runs automaticly behind the scene while sending and retrieving data
userSchema.methods.toJSON = function () {

    const userObject = this.toObject()
    console.log(userObject)

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//check login credentials
userSchema.statics.checkCredentials = async (email, password) => {

    try {
        const userCheck = await User.findOne({email: email})
        if (!userCheck) {
            res.status(404).send('Invalid credentials')
        }
        const isValidPassword = await bcrypt.compare(password, userCheck.password)
    
        if(!isValidPassword) {
            res.status(404).send('Invalid password')
        }
        return userCheck   
        
    } catch (error) {
        
        res.status(500).send('Eroare, nu s-a putut accesa baza de date.')
    }
}

const User = mongoose.model('User', userSchema)

module.exports = User