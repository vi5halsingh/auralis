
const { ApiResponse } = require('../utils/apiResponse');
const { uploadToCloudinary } = require('../utils/cloudinary');
const registerUser = async (req, res) => {
   const image1localpath =  req.files?.image1[0]?.path;
   const image2localpath =  req.files?.image2[0]?.path;
    const image1 = await uploadToCloudinary(image1localpath)
    const image2  = await uploadToCloudinary(image2localpath)
   
    res.status(200).json(new ApiResponse("registered successfully", { img1:image1.url, img2:image2.url }, 200));
}
 

module.exports = {registerUser};