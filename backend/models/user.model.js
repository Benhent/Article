import mongoose from "mongoose";
import {applyAvatar} from "../middlewares/generateAvatar.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatarUrl:{
        type: String,
        default: ''
    },
    link: {
        type: String,
        required: true
    },
    national: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'author', 'admin', 'reviewer', 'editor', 'submitter'],
        default: 'user'
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, {timestamps: true});

applyAvatar(userSchema);

export const User = mongoose.model("User", userSchema);