const bcrypt = require('bcryptjs')
const createError = require('http-errors')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const { signAccessToken, signRefreshToken, verifyAccessToken } = require('../utils/jwt_helpers')

const { STATIC_SALT } = process.env

module.exports = {
	registerUser: async (req, res) => {
		try {
			const { username, salt, password } = req.body
			const doseExists = await User.findOne({ username: username })
			if (doseExists) return res.status(400).json({ message: 'Người dùng đã tồn tại' })
			if (!password) return res.status(400).json({ message: 'Please enter your password' })
			if (password.length < 6)
				return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' })

			// password encryption
			const staticSalt = STATIC_SALT
			const concatenatePassword = staticSalt.concat(password).concat(salt)
			const passwordHash = await bcrypt.hash(concatenatePassword, 12)
			const newUser = new User({
				_id: new mongoose.Types.ObjectId(),
				username,
				salt: salt,
				passwordHash: passwordHash,
				role: 0,
			})
			const result = await newUser.save()
			const access_token = await signAccessToken(result._id)
			res.status(200).json({
				user: result,
				access_token,
			})
		} catch (error) {
			res.status(400).json({
				message: error,
			})
		}
	},

	login: async (req, res) => {
		try {
			const { username, password } = req.body
			const user = await User.findOne({ username: username.toLowerCase().trim() })
			if (!user) return res.status(400).json({ message: 'Tên người dùng không tồn tại' })

			const staticSalt = STATIC_SALT
			const { salt, passwordHash } = user
			const concatenatePassword = staticSalt.concat(password).concat(salt)
			const isMatch = await bcrypt.compare(concatenatePassword, passwordHash)
			if (!isMatch) return res.status(400).json({ message: 'Sai tên người dùng hoặc mật khẩu' })
			const accessToken = await signAccessToken(user)
			const refreshToken = await signRefreshToken(user)
			const userResult = await User.findById(user._id)
			res.send({
				accessToken: accessToken,
				refreshToken: refreshToken,
				user: userResult,
			})
		} catch (error) {
			res.status(400).json({
				message: error,
			})
		}
	},

	getProfile: async (req, res) => {
		try {
			const user = await User.findById(req.data.id).select('-password')
			if (!user) return res.status(400).json({ message: 'User does not exist.' })
			res.status(200).json({
				user: user,
			})
		} catch (error) {
			res.status(400).json({
				message: error,
			})
		}
	},

	refreshToken: async (req, res) => {
		try {
			const refreshToken = req.body
			if (!refreshToken) throw createError.BadRequest()
			const id = await verifyAccessToken(refreshToken)
			const accessToken = await signAccessToken(id)
			const refToken = await signRefreshToken(id)
			res.send({ accessToken: accessToken, refreshToken: refToken })
		} catch (error) {
			res.status(400).json({
				message: error,
			})
		}
	},
}
