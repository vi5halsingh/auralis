const express = require('express')
const { route } = require('../app')
const  upload  = require('../middlewares/multer.middleware.js');
const { registerUser } = require('../controllers/user.controller.js');
const router = express.Router()

router.route('/register').post(
    upload.single('profileImage'),
    registerUser
);

module.exports = router