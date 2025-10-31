const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
//defining user schema
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        minLength: 6,

    },
    profileImageUrl: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    plan: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    refreshToken: {
        type: [String],
        default: [],
        required: true,
    }

}, { timestamps: true });

//Methods

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) next();  
        this.password = await bcryptjs.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcryptjs.compare(password, this.password)
}

userSchema.methods.generateAccessToken = () => {
    const token = jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName,
        role:this.role

    }, process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN });
    return token;
}


userSchema.methods.generateRefreshToken = () => {
    const token = jwt.sign({ _id:this._id }, process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
    return token;
}
const userModel = mongoose.model('User', userSchema);

module.exports = { userModel };