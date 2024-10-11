// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bmi: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user' // ค่าเริ่มต้นเป็นผู้ใช้ทั่วไป
    }
});

module.exports = mongoose.model('User', userSchema);