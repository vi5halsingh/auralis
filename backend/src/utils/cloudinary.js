const cloudinary = require('cloudinary').v2
const { asyncHandler } = require('./asyncHandler')
const fs = require('fs');
const { ApiError } = require('./apiError');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const uploadToCloudinary =  async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        //uploading to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })
     console.log('Cloudinary upload response:', response.url);
     fs.unlinkSync(localFilePath); // Delete the local file after upload
     return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.error('Error uploading to Cloudinary:', error);
        return new ApiError(500, 'Cloudinary upload failed');
    }

}
 module.exports ={uploadToCloudinary}