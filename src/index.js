const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const bcryptjs = require('bcryptjs')
const fs = require('fs')


const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is runing on port -> ' + port)
    // console.log(process.env.EMAIL_ADDRESS)
    // console.log(process.env.KEY)
    // console.log(process.env.TOKEN_ENCRYPTION_KEY)
})

