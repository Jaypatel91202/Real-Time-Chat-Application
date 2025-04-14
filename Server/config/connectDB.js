const mongoose = require('mongoose');

async function connectDB() {
    try {
        const uri = process.env.MONGODB_URI;

        // Validate if URI starts with correct scheme
        if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
            throw new Error("Invalid MongoDB URI scheme. Make sure it starts with 'mongodb://' or 'mongodb+srv://'");
        }

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log("✅ Connected to MongoDB successfully");
        });

        connection.on('error', (error) => {
            console.log("❌ MongoDB connection error:", error);
        });

    } catch (error) {
        console.log("❌ Error connecting to MongoDB:", error.message);
    }
}

module.exports = connectDB;
