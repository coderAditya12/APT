import mongoose from "mongoose"
const mongoUrl = process.env.MONGO_URL

const connectDB = async()=>{
    try {
        const mongoUrl = process.env.MONGO_URL

        if (!mongoUrl) {
            throw new Error("MONGO_URL is not defined")
        }

        const connectedDB = await mongoose.connect(mongoUrl)
        console.log(`MongoDB connected: ${connectedDB.connection.host}`)
    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
    }
}
export default connectDB
