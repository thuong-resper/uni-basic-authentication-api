const mongoose = require('mongoose')

const connectDB = async () => {
	try {
		const connect = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		// console.log(connect.connection.host)
	} catch (error) {
		if (error) throw error
		console.error(`error: ${error.message}`)
	}
}

module.exports = connectDB
