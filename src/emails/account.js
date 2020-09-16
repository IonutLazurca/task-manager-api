const nodemailer = require('nodemailer')

const senderMailer = process.env.EMAIL_ADDRESS
const senderMailerKey = process.env.KEY

const emailTransporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    service: 'yahoo',
    secure: true,
    requireTLS: true,
    auth: {
        user: senderMailer,
        pass: senderMailerKey
    },
    debug: false,
    logger: true

})

// emailTransporter.verify(function(error, success) {
//     if (error) {
//         console.log(error)
//     } else {
//         console.log('Server is ready to take our messages')
//     }
// })

// let message = {
//     from: 'ionut.lazurca@yahoo.com',
//     to: 'ionut.lazurca@gmail.com',
//     subject: 'test',
//     text: 'I hope this message gets through'
// }

const sendWelcomeEmail = (email, name) => {

    try {
        let message = {
            from: 'ionut.lazurca@yahoo.com',
            to: email,
            subject: 'Thanks for joining in',
            text: 'Welcome to our store dear ' + name + '. We wish you have a good experience with our services'
        }
        emailTransporter.sendMail(message)
        
    } catch (error) {
        console.log(error)
        
    }
}

const sendMailOnCancelAccount = (email, name) => {

    try {
        let message = {
            from: 'ionut.lazurca@yahoo.com',
            to: email,
            subject: 'We are sorry you are canceling the account',
            text: 'Dear ' + name + '. Please let us know about your experiences with our services. If we can do something to bring you back please let us know.'
        }
        emailTransporter.sendMail(message)
        
    } catch (error) {
        console.log(error)
        
    }
}

module.exports = {
    sendWelcomeEmail : sendWelcomeEmail,
    sendMailOnCancelAccount: sendMailOnCancelAccount
}
