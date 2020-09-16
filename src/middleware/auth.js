const jwt = require('jsonwebtoken')
const User = require('../models/user')
// const { updateOne } = require('../models/user')
const keyEncryption = process.env.TOKEN_ENCRYPTION_KEY

const auth = async (req, res, next) => {

    try {

        const userTokenReq = req.header('Authorization').replace('Bearer ', '')
        // console.log(userTokenReq)
        const decoded = jwt.verify(userTokenReq, keyEncryption)
        // console.log(decoded)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': userTokenReq})
        
        // console.log(user)
        if (!user) {
            throw new Error()
        }

        // if (req.path === '/users/logout') {            

        //     const updatedTokens = await user.tokens.filter((token) => token.token !== userTokenReq)
        //     user.tokens = updatedTokens
        //     await user.save()
        // }
        req.token = userTokenReq
        req.user = user
        next()     
        
    } catch (error) {

        res.status(401).send('error: Please authenticate.')
        
    }    
}

module.exports = auth
                