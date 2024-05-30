const authorized=(...roles)=>
    async(req,res,next)=>{
       if(!roles.includes(req.user.role)){
        return next(res.status(400).json({
            success:false,
            message:"you do not have permission for this route"
        }))
       }
       next()
    }

    module.exports=authorized