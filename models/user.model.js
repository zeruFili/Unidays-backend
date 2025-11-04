const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		first_name: {
			type: String,
			required: true,
		},
		last_name: {
			type: String,
			required: true,
		},
		phone_number: {
			type: String,
			required: true, 
			unique: true,   
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		 profileImage: {
    type: String,
    default: ''
  },
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		 role: {
    type: String,
    enum: ['super_admin', 'admin', 'student', 'company'],
    default: 'student'
  },
		refreshToken: { // Add this line
			type: String,
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;