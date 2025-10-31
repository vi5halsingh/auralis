const express = require('express')
const { route } = require('../app')
const  upload  = require('../middlewares/multer.middleware.js');
const { registerUser, loginUser, reGenerateAccessAndRefreshToken } = require('../controllers/user.controller.js');
const { authenticatUser } = require('../middlewares/auth.middleware.js');
const router = express.Router()

router.route('/register').post(
    upload.single('profileImage'),
    registerUser
);
router.route('/login').post(
    loginUser
);

// protected routes 
router.route('/refresh/token').post(
    authenticatUser,
     reGenerateAccessAndRefreshToken
);


module.exports = router