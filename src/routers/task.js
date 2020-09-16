const express = require('express')
require('../db/mongoose')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const User = require('../models/user')
const router = new express.Router()


// get tasks
router.get('/users/me/tasks',auth, async (req, res) => {

    const match = {}

    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    console.log(req.user._id)

    try {
        // const tasks = await Task.find({owner: req.user._id}).exec()
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort               
            }
        }).execPopulate()
        if(!req.user.tasks) {
            return res.status(404).send('Could not find any task: ')
          } else {
            res.send(req.user.tasks)
          }
        
    } catch (error) {
        res.status(500).send('Could not retrieve data from database', error)        
    }
})

//get task by id
router.get('/users/me/tasks/:id', auth, async (req, res) => {

    const id = req.params.id
    try {
        const task = await Task.findOne({_id: id, owner: req.user._id})
        if(!task) {
            return res.status(404).send('Could not find task: ' + id)
          } else {
            res.status(200).send(task)
          }
    } catch (error) {
      res.status(500).send('Could not access the database. ' + error)
    }
})

//get task by name
router.get('/users/me/tasks/name/:name', auth, async (req, res) => {

    console.log(req.user._id)
    
    const _name = req.params.name

    try {
        
        const findByTaskName = await Task.find({task: _name, owner: req.user._id})

        if(!findByTaskName) {
            return res.status(404).send('Could not find task: ' + _name)
          }           
          res.status(200).send(findByTaskName)      

    } catch (error) {
      res.status(500).send('Could not access the database. ' + error)        
    }
})

// insert new task
router.post('/users/me/tasks', auth, async (req, res) => {

    console.log(req.body)

    const task = new Task(req.body)
    task.owner = req.user._id
    task.time = Date.now()

    try {
        const insertTask = await task.save()
        console.log('Task added to the database', insertTask)
        res.status(201).send(insertTask)
        
    } catch (error) {
        console.log('Could not save task into database. ' + error)
        res.status(400).send('Could not save task into database. ' + error)        
    }
})

router.patch('/users/me/tasks/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    console.log(updates)
    const allowedUpdates = ['completed', 'task', 'description']
    const isValidOperation = updates.every((params) => {
        return allowedUpdates.includes(params)
    })

    if (!isValidOperation) {
        return res.status(400).send('Error: invalid update parameters')
    }

    try {
        // const task = await Task.findByIdAndUpdate({_id:req.params.id, owner: req.user._id}, req.body, {new: true, runValidators: true})
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if(task) {
            res.send(task)
        } else {
            return res.status(404).send('Could not find task by specified _id')
        }        
    } catch (error) {
        res.status(404).send('Could not access resource for editing', error)         
    }
})

router.delete('/users/me/tasks/:id', auth, async (req, res) => {
    const id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id: id, owner: req.user._id}).exec()
        
        if(!task) {
            return res.status(404).send('Could not find any task with the specified _id')
        }
        res.send(task)
    } catch (error) {
        res.status(404).send('Could not access the resource')        
    }
})

module.exports = router