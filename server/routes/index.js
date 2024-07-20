const express = require('express')
const registerUser = require('../controller/registerUser')
const checkEmail = require('../controller/checkEmail')
const checkPassword = require('../controller/checkPassword')
const userDetails = require('../controller/userDetails')
const logout = require('../controller/logout')
const updateUserDetails = require('../controller/updateUserDetails')
const searchUser = require('../controller/searchUser')

const router = express.Router()

//create user api
router.post('/register',registerUser)
//check user email
router.post('/email', (req, res) => {
    // Handle the request and send a response
    res.setHeader('Access-Control-Allow-Origin', 'https://real-time-chat-application-client.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.json({ message: 'Email endpoint hit!' });
});

//check user password
router.post('/password',checkPassword)
//login user details
router.get('/user-details',userDetails)
//logout user
router.get('/logout',logout)
//update user details
router.post('/update-user',updateUserDetails)
//search user
router.post("/search-user",searchUser)


module.exports = router
