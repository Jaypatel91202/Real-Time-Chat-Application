const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookiesParser = require('cookie-parser');
const { app, server } = require('./socket/index'); // Ensure WebSocket setup is correct


// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL, // Specify the allowed origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies and credentials
};

// Middleware setup
app.use(cors(corsOptions)); // Apply CORS configuration
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookiesParser()); // Middleware to parse cookies

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
