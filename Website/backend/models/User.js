const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    balance: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Diamond'],
        default: 'Bronze'
    },
    isVerified: {  
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    verificationCode: {
        type : String,
        dèault: null
    },   
    resetPasswordCode: String,
 //   resetCodeExpiry: Date,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.pre('save', function(next) {
    if (this.isModified('balance') || this.isNew) {
        if (this.balance > 100000000) {
            this.tier = 'Diamond';
        } else if (this.balance > 50000000) {
            this.tier = 'Gold';
        } else if (this.balance > 10000000) {
            this.tier = 'Silver';
        } else {
            this.tier = 'Bronze';
        }
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
