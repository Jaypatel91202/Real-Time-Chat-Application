const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB'); // Ensure this is configured correctly
const router = require('./routes/index'); // Your API routes
const cookiesParser = require('cookie-parser');
const { app, server } = require('./socket/index'); // Ensure your socket setup is correct

const PORT = process.env.PORT || 8080;

// Middleware setup
const allowedOrigins = [
    'https://real-time-chat-application-client.vercel.app',
    'https://real-time-chat-application-client-krplcmr2n.vercel.app'
];

app.use(cors({
    origin: function(origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
});

// Socket.io setup
const io = require('socket.io')(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
});

// Example of a basic Socket.io event
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

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
