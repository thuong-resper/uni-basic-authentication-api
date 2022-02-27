const router = require('express').Router()
const { getProfile, login, refreshToken, registerUser } = require('../controllers/userController')
const { verifyAccessToken } = require('../utils/jwt_helpers')

router.post('/user/register', registerUser)
router.post('/user/login', login)
router.get('/user/profile', verifyAccessToken, getProfile)
router.post('/user/refresh-token', refreshToken)

module.exports = router
