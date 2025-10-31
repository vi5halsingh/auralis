const express = require('express')
const { route } = require('../app')
const  upload  = require('../middlewares/multer.middleware.js');
const { registerUser, loginUser } = require('../controllers/user.controller.js');
const router = express.Router()

router.route('/register').post(
    upload.single('profileImage'),
    registerUser
);
router.route('/login').post(
    loginUser
);

module.exports = router