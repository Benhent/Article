import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
    try {
        // Log the MongoDB URI for debugging purposes
        console.log("mongo_uri: ", process.env.MONGO_URI);
        
        // Attempt to connect to MongoDB using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        // Log a success message with the host of the connected MongoDB server
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        // Log an error message if the connection fails and exit the process
        console.log("Error connecting to MongoDB: " + error.message);
        process.exit(1); // Exit with failure code
    }
};