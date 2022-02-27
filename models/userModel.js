const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	salt: {
		type: String,
		required: true,
	},
	passwordHash: {
		type: String,
		required: true,
	},
	role: {
		type: Number,
		default: 0,
	}, //  0 = user , 1 = admin
})

module.exports = mongoose.model('User', userSchema)
