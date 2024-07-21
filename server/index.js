const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const { app, server } = require('./socket/index');

const PORT = process.env.PORT || 8080;


// CORS Configuration
const corsOptions = {
    origin: 'http://localhost:3000', // Temporarily hardcoding to test
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies and credentials
};

// Middleware setup
app.use(cors(corsOptions)); // Apply CORS configuration
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

// Handle preflight requests
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// Simple health check route
app.get('/', (req, res) => {
    res.json({
        message: "Server running at " + PORT,
    });
});

// API endpoints
app.use('/api', router);

// Database connection and server start
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log("Server running at " + PORT);
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });
