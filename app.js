const express=require('express')
const app=express()
require('dotenv').config()
const database=require('./database/db.js')
const router=require('./router/router.js')
const cookieparser=require('cookie-parser')
database()

app.use(cookieparser())
app.use(express.json())
app.use('/',router)

module.exports=app