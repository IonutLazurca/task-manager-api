const fs = require('fs')
const express = require('express')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const mail = require('../emails/account')
const router =new express.Router()
require('../db/mongoose')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const upload = multer({    
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload photo files'))
        }
        cb(undefined, true)

    }
})

//Insert users into database
router.post('/users/register', async (req, res) => {

    // console.log(req.body)

    const user = new User(req.body)    

    try {
        const token = await user.generateAuthToken()
        await user.save()

        mail.sendWelcomeEmail(user.email, user.name)

        console.log('User added to the database', user)
        res.status(201).send({status: 'Logged in Successfuly', token, user})
    } catch (error) {
        res.status(400).send('Could not save user into database. ' + error)        
    }
})

router.post('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer

    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {

    try {
        req.user.avatar = undefined
        await req.user.save()
    
        res.send('Avatar deleted')
        
    } catch (error) {
        res.status(404).send('Could not delete avatar picture')
        
    }
})

router.get('/users/:id/avatar', async (req, res) => {  

    try {
        const user = await User.findById(req.params.id)
            if (!user || !user.avatar) {
                throw new Error()
            }
            res.set('Content-Type', 'image/png')
            res.send(user.avatar)
               
    } catch (error) {
        res.status(404).send('Could not access database')        
    }



})

router.post('/users/login', async(req, res) => {

    try {
        const user = await User.checkCredentials(req.body.email, req.body.password)

        if(user) {
            const token = await user.generateAuthToken()
        
            res.send({user, token})            
        } else {
            res.status(500).send('User does not exist')
        }  
        
    } catch (error) {
        res.status(400).send('Could not get login', error)
    }    
})

router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('Logout')
        
    } catch (error) {
        res.status(500).send()        
    }
    
})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Logout all instances')
        
    } catch (error) {
        res.status(500).send()        
    }
    
})

router.get('/users', auth ,async (req, res) => { 

    const users = await User.find({})

    res.send(users)
})

//get all users from database
router.get('/users/me', auth ,async (req, res) => { 

    const user = req.user

    res.send(user)
})

//get users by id
router.get('/users/:id', async (req, res) => {

    const id = req.params.id

    try {
        const user = await User.findById({_id: id})
        if(!user) {
            return res.status(404).send('Could not find the user: ' + id)
          } else {
            res.status(200).send(user)
          }
    } catch (error) {
      res.status(500).send('Could not access the database. ' + error)
    }
})

// update user
router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    console.log(updates)
    const allowedUpdates = ['name', 'age', 'password', 'email']
    const isValidOperation = updates.every((params) => {
        return allowedUpdates.includes(params)
    })

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'})
    }

    try {        
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
   
        res.send(req.user)
       
        
    } catch (error) {
        res.status(400).send(error)        
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     res.status(404).send()
        // }
        await req.user.remove()
        mail.sendMailOnCancelAccount(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send()        
    }
})

module.exports = router