const express = require('express')
const { route } = require('../app')
const  upload  = require('../middlewares/multer.middleware.js');
const { registerUser } = require('../controllers/user.controller.js');
const router = express.Router()
// router.get('/', asyncHandler (async (req,res)=>{
//     res.status(200).json(new ApiResponse("User route is working fine",null , 200))
// }));

router.route('/register').post(
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 }
    ]),
    registerUser
);

module.exports = router