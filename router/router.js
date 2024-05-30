const express=require('express')
const router=express.Router()
const {signup, signin, profile, logout, addImage}=require('../controller/controller.js')
const isLogin = require('../middleware/isLogin.js')
const uplaod = require('../middleware/upload.js')
const authorized = require('../middleware/authorized.js')

router.post('/signup',signup)
router.post('/signin',signin)
router.get('/profile',isLogin,profile)
router.get('/logout',isLogin,logout)
router.post('/addimage',isLogin,authorized("ADMIN"),uplaod.single('image'),addImage)

module.exports=router