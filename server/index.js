const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookiesParser = require('cookie-parser');
const { app, server } = require('./socket/index'); // Ensure your socket setup is correct

const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(cors({
    origin: 'https://real-time-chat-application-client-krplcmr2n.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookiesParser()); // Middleware to parse cookies

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
