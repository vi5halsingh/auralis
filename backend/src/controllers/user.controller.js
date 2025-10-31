
const { ApiResponse } = require('../utils/apiResponse');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { userModel} = require('../models/user.model');
const { ApiError } = require('../utils/apiError');
const bcryptjs = require('bcryptjs');
const { asyncHandler } = require('../utils/asyncHandler');

const generateAccessAndRefreshToken =  async (userId) =>{
  // console.log("user",user)
  try {
     const user = await userModel.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = [refreshToken]
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
  } catch (error) {
    console.log(error)
  }
}

const registerUser = asyncHandler(
  async (req, res) => {


  
     const {fullName ,email , password } = req.body;
 
    if(!email || !fullName || !password){
      res.status(400).json(new ApiError(400,"All feilds are requierd"))
    }

    const ProfileImageLocalPath = req.file?.path;
  //  console.log("profileImage",ProfileImageLocalPath)
    const profileImage = await uploadToCloudinary(ProfileImageLocalPath)

    const existingUser = await userModel.findOne({email})
 
    if(existingUser){
     res.status(409).json(new ApiError(409 ,message = "User with email and username already exists") ) 
  
    }
 
    const user = await userModel.create({
     email,
     fullName,
     password ,
     profileImageUrl:profileImage?.url,
    })
    
    const createdUser =await userModel.findById(user._id).select("-password -refreshToken")  

    if(!createdUser) {
      res.status(500).json( new ApiError(500 ,  "Something went wrong while registering the user") )
    }
     res.status(201).json(
         new ApiResponse(201 ,"User registered successfully",createdUser)
     );
   
}
)


const loginUser = asyncHandler(
  async (req, res) =>{

    
    const {email ,userName, password} = req.body

    if(
      [email , password].some((
        (field) => field?.trim()===""))
    ){
     return res.status(400).josn(new ApiError(400 , "All feils are required"))
      
    }

    const user = await userModel.findOne({
      $or:[{userName },{ email}]
    })
// console.log("user form login", user._id )
    if(!user){
       res.status(403).json(new ApiError(403,"User is not registered"))
    }

   const isPasswordMatched =  await user.isPasswordCorrect(password)
// console.log("isPasswordMatched", isPasswordMatched)
   if(!isPasswordMatched){
    return res.status(401).json(new ApiError(401 , "Invalid crendentials"))
   }
   

   const {accessToken , refreshToken  } = await generateAccessAndRefreshToken(user._id)

   if(!accessToken || !refreshToken){
    return new ApiError(500,"Something went wrong while loggin in")
   }

  const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken")

const options = {
        httpOnly: true,
        secure: true
    }
   res.status(200)
   .cookie("accessToken", accessToken , options)
   .cookie('refreshToken', refreshToken , options)
   .json(new ApiResponse(200 , "Logged in successfully ",{loggedInUser , refreshToken , accessToken} ))
  })
 

module.exports = {registerUser , loginUser};