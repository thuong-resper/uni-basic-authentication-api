const createError = require('http-errors')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

module.exports = {
	signAccessToken: (id) => {
		return new Promise((resolve, reject) => {
			const options = {
				expiresIn: '1d',
			}
			jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, options, (err, token) => {
				if (err) reject(createError.InternalServerError())
				resolve(token)
			})
		})
	},
	signRefreshToken: (id) => {
		return new Promise((resolve, reject) => {
			const options = {
				expiresIn: '7d',
			}
			jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, options, (err, token) => {
				if (err) reject(createError.InternalServerError())
				resolve(token)
			})
		})
	},
	verifyAccessToken: async (req, res, next) => {
		const token = req.headers.authorization?.split(' ')[1]
		if (!token) return next(createError.Unauthorized())
		try {
			const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
			req.data = verified
			next()
		} catch {
			res.status(400).send('Invalid token')
		}
	},
	verifyAdminRole: async (req, res, next) => {
		const { email } = req.data.id
		const adminUser = await User.findOne({ email }).exec()
		if (adminUser.role !== 1) {
			res.status(403).json({
				err: 'Admin resource. Access denied.',
			})
		} else {
			next()
		}
	},
}
