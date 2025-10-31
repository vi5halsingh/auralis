const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
//defining user schema
const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        index:true,
        lowercase:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true
    },
     fullName:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        minLength:6,
        
    },
    profileImageUrl:{
        type:String,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    plan:{
        type:String,
        enum:['free','premium'],
        default:'free'
    },
    refreshToken:{
        type:[String],
        default:[],
        required:true,
    }

},{timestamps:true});

//Methods

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        this.password = await bcryptjs.hash(this.password,10);
    };
    next();
})

userSchema.methods.generateAccessToken = async(options) => {
const token = await jwt.sign(options , process.env.JWT_SECRET, 
{expiresIn:process.env.JWT_EXPIRES_IN});
return token;
}

userSchema.methods.isPasswordCorrect = async function (password) {
return await bcryptjs.compare(password , this.password)
}
userSchema.methods.generateRefreshToken = async(options) => {
    const token =jwt.sign(options , process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN});
    return token;
    }
const userModel = mongoose.model('User', userSchema);

module.exports = {userModel};