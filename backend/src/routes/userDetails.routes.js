const express = require('express')
const { 
    createUserDetails, 
    getUserDetails, 
    updateUserDetails, 
    deleteUserDetails, 
    getAllUserDetails 
} = require('../controllers/userDetails.controller.js');
const { authenticatUser } = require('../middlewares/auth.middleware.js');
const router = express.Router()

router.route('/create').post(
    authenticatUser,
    createUserDetails
);

router.route('/me').get(
    authenticatUser,
    getUserDetails
);

router.route('/update').patch(
    authenticatUser,
    updateUserDetails
);

router.route('/delete').delete(
    authenticatUser,
    deleteUserDetails
);

router.route('/all').get(
    authenticatUser,
    getAllUserDetails
);

module.exports = router