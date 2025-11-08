const express = require('express')
const  upload  = require('../middlewares/multer.middleware.js');
const { registerUser, loginUser, reGenerateAccessAndRefreshToken , logoutUser } = require('../controllers/user.controller.js');
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

router.route('/logout').post(
    authenticatUser,
    logoutUser
)
module.exports = router