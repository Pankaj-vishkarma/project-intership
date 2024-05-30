const userSchema=require('../schema/userSchema.js')
const bcrypt=require('bcrypt')
const emailvalidator=require('email-validator')
const cloudinary=require('cloudinary')
const fs=require('fs/promises')

const cookieOption={
  maxAge:24*60*60*1000,
  httpOnly:true
}

const signup=async(req,res)=>{
 const {name,email,password,confirmpassword}=req.body
 if(!name || !email || !password || !confirmpassword){
    return res.status(400).json({
        success:false,
        message:"All fields are required"
    })
 }
 if(password !== confirmpassword){
    return res.status(400).json({
        success:false,
        message:"password and confirmpassword are not match"
    })
 }
 const valid_email=emailvalidator.validate(email)
 if(!valid_email){
    return res.status(400).json({
        success:false,
        message:"please provide a valid email"
    })
 }
 try{
      const exits_email=await userSchema.findOne({email})
      if(exits_email){
        return res.status(400).json({
            success:false,
            message:'account already exits'
        })
      }
      const user=await userSchema.create({name,email,password})

      if(!user){
        return res.status(400).json({
            success:false,
            message:"user not created"
        })
      }

      await user.save()
      return res.status(200).json({
        success:true,
        data:user
      })
 }catch(e){
    return res.status(400).json({
        success:false,
        message:e.message
    })
 }
}

const signin=async(req,res)=>{
  const {email,password}=req.body

  if(!email || !password){
    return res.status(400).json({
      success:false,
      message:"email and password are required"
    })
  }

  try{
       const user=await userSchema.findOne({email}).select('+password')

       if(!user || !(bcrypt.compare(password,user.password))){
        return res.status(400).json({
          success:false,
          message:"invalied credentilas"
        })
       }
       const token=user.jwtToken()
       user.password=undefined
       res.cookie('token',token,cookieOption)

       return res.status(200).json({
        success:true,
        data:user
       })

  }catch(e){
    return res.status(400).json({
      success:false,
      message:e.message
    })
  }
}

const profile=async(req,res)=>{
  const userId=req.user.id
  try{
      const user=await userSchema.findById(userId)
      if(!user){
        return res.status(400).json({
          success:false,
          message:"id not found"
        })
      }

        return res.status(200).json({
          success:true,
          data:user
        })
      }catch(e){
    return res.status(400).json({
      success:false,
      message:e.message
    })
  }
}

const logout=(req,res)=>{
  const cookieOption1={
    maxAge:new Date(),
    httpOnly:true
  }
  try{
      res.cookie('token',null,cookieOption1)
      return res.status(200).json({
        success:true,
        message:'Logged Out'
      })
  }catch(e){
    return res.status(400).json({
      success:true,
      message:e.message
    })
  }
}

const addImage=async(req,res)=>{
  const userId=req.user.id
  const imageData={}
  const user=await userSchema.findById(userId)

  if(!user){
    return res.status(400).json({
      success:true,
      message:'user not found'
    })
  }

  if(req.file){
    try{
       const result=await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'backend-project'
       })

       if(result){
        imageData.public_id=result.public_id,
        imageData.secure_url=result.secure_url
       }
       fs.rm(`pankaj/${req.file.filename}`)

    }catch(e){
      return res.status(400).json({
        success:false,
        message:e.message
      })
    }
  }

  user.images.push({
    image:imageData
  })

  await user.save()

  return res.status(200).json({
    success:true,
    data:user
  })
}

module.exports={signup,signin,profile,logout,addImage}