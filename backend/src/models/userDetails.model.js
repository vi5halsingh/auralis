const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    bodyDetails:{
        height: {
            type: Number,
            trim: true
        },
        weight: {
            type: Number,
            trim: true
        },
        age:{
            type: Number,
            trim: true
        }
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        default: 'prefer_not_to_say'
    },
    location: {
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true
        }
    },

    isProfileComplete: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

userDetailsSchema.index({ userId: 1 });
// userDetailsSchema.index({ phoneNumber: 1 });

const userDetailsModel = mongoose.model('UserDetails', userDetailsSchema);

module.exports = { userDetailsModel };
