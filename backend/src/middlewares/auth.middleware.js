const jwt  = require("jsonwebtoken");
const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { userModel } = require("../models/user.model");

const authenticatUser = asyncHandler(
    async(req ,res, next)=>{
        const token = req.cookies?.accessToken || req.header.Authorization
     
        if(!token){
            res.status(401).json(new ApiError(401,"User unauthorized"))
        }

        const decode = await jwt.verify(token , process.env.JWT_SECRET)

        const user = await userModel.findById(decode._id).select("-password -refereshToken")
        if(!user){
            res.status(401).json(new ApiError(401 , "Invalid token"))
        }

        req.user = user;
        next()
    }
)

module.exports = {authenticatUser};