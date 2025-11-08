const { ApiResponse } = require('../utils/apiResponse');
const { userDetailsModel } = require('../models/userDetails.model');
const { userModel } = require('../models/user.model');
const { ApiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');

const createUserDetails = asyncHandler(
    async (req, res) => {
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json(new ApiError(401, "User not authenticated"))
        }

        const existingDetails = await userDetailsModel.findOne({ userId });
        if (existingDetails) {
            return res.status(409).json(new ApiError(409, "User details already exists"))   
        }

        const {
            bodyDetails:{height
                ,weight
                ,age
            },
            dateOfBirth,
            gender,
            phoneNumber,
            location,
        } = req.body;

        const userDetails = {
            userId,
            bodyDetails:{
                height,
                weight,
                age,
            },  
            dateOfBirth,
            gender,
            phoneNumber,
            location,
        };


        // check and delete if any of feild is undefinded 
        Object.keys(userDetails).forEach(key => 
            userDetails[key] === undefined && delete userDetails[key]
        );

        const userProfile = await userDetailsModel.create(userDetails); 

        if (!userProfile) {
            return res.status(500).json(new ApiError(500, "Something went wrong while uploading user details"))
        }

        const createdProfile = await userDetailsModel.findById(userProfile._id);
        console.log("details seciton in userdetials controller ",createdProfile)
        return res.status(201).json(
            new ApiResponse(201, "User details uploaded successfully", createdProfile)  
        );
    }
)

const getUserDetails = asyncHandler(        
    async (req, res) => {
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json(new ApiError(401, "User not authenticated"))
        }

        const profile = await userDetailsModel.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                email: 1,
                                profileImageUrl: 1,
                                role: 1,
                                plan: 1,
                                createdAt: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 1,
                    bodyDetails: 1,
                    dateOfBirth: 1,
                    gender: 1,
                    location: 1,
                    isDetailsComplete: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userDetails: 1
                }
            }
        ]);

        if (!profile || profile.length === 0) {
            return res.status(404).json(new ApiError(404, "User details not found"))    
        }

        return res.status(200).json(
            new ApiResponse(200, "User details retrieved successfully", profile[0])
        );
    }
)

const updateUserDetails = asyncHandler(
    async (req, res) => {
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json(new ApiError(401, "User not authenticated"))
        }

        const { 
                height,
                weight,
                age,
            dateOfBirth,
            gender,
            location,
        } = req.body;
        const updateData = {
            bodyDetails:{}
        };
        
        if (height !== undefined) updateData.bodyDetails.height = height;
    
        if (weight !== undefined) updateData.bodyDetails.weight = weight;
        if (age !== undefined) updateData.bodyDetails.age = age;    
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updateData.gender = gender;
        if (location !== undefined) updateData.location = location;

        const updatedDetails = await userDetailsModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedDetails) {
            return res.status(404).json(new ApiError(404, "User details not found"))
        }

        return res.status(200).json(
            new ApiResponse(200, "User details updated successfully", updatedDetails)
        );
    }
)

const deleteUserDetails = asyncHandler(
    async (req, res) => {
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json(new ApiError(401, "User not authenticated"))
        }

        const deletedDetails = await userDetailsModel.findOneAndDelete({ userId });

        if (!deletedDetails) {
            return res.status(404).json(new ApiError(404, "User details not found"))
        }

        return res.status(200).json(
            new ApiResponse(200, "User details deleted successfully")
        );
    }
)

const getAllUserDetails = asyncHandler( 
    async (req, res) => {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        const matchStage = {};
        if (search) {
            matchStage.$or = [
                { bio: { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } },
                { 'location.country': { $regex: search, $options: 'i' } }
            ];
        }

        const details = await userDetailsModel.aggregate([  
            {
                $match: matchStage
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                email: 1,
                                profileImageUrl: 1,
                                role: 1,
                                plan: 1,
                                createdAt: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 1,
                    dateOfBirth: 1,
                    gender: 1,
                    phoneNumber: 1,
                    location: 1,
                    isProfileComplete: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userDetails: 1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        const totalCount = await userDetailsModel.countDocuments(matchStage);

        return res.status(200).json(
            new ApiResponse(200, "User details retrieved successfully", {
                details,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit)
                }
            })
        );
    }
)

module.exports = {
    createUserDetails,
    getUserDetails, 
    updateUserDetails,
    deleteUserDetails,
    getAllUserDetails   
};