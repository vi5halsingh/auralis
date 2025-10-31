
const { ApiResponse } = require('../utils/apiResponse');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { userModel} = require('../models/user.model');
const { ApiError } = require('../utils/apiError');
const bcryptjs = require('bcryptjs');
const { asyncHandler } = require('../utils/asyncHandler');
const registerUser = asyncHandler(
  async (req, res) => {
    //get values from req body
    // check  values should not be empty
    // check user with email or username already exists
    //hashn password
    //check file upload
    //create user in db
    //check user creation 
    // remove password or referesh token
    // send response

  
     const {userName , email ,fullName, password } = req.body;
    //  if(
    //      [userName , email ,fullName, password].some((feild) => feild?.trim() === " ")
    //     ){
    //     //  console.log('username ' , userName)
    //     res.status(400).json(new ApiError(400, "all feilds are required"))
    //  }
 
    if(!userName || !email || !fullName || !password){
      res.status(400).json(new ApiError(400,"All feilds are requierd"))
     
    }

 
    const ProfileImageLocalPath = req.file?.path;
   
    if(!ProfileImageLocalPath){
     res.status(400).json (new ApiError(400 , "Profile image is required"))
     return null;
    }
    

    const existingUser = await userModel.findOne({
     $or:[{userName},{email}]
    })
 
    if(existingUser){
     res.status(409).json(new ApiError(409 ,message = "User with email and username already exists") ) 
  
    }
 
    const salt = bcryptjs.genSaltSync(19)
    const hashedPassword = await bcryptjs.hash(password , salt)

     const profileImage = await uploadToCloudinary(ProfileImageLocalPath)
  

    const user = await userModel.create({
     userName,
     email,
     fullName,
     password : hashedPassword,
     profileImageUrl:profileImage.url,
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
 

module.exports = {registerUser};