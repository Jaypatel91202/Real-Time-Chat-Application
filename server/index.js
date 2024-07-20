const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./config/connectDB'); // Ensure this file is correctly set up
const router = require('./routes/index'); // Ensure this file has your API routes

const PORT = process.env.PORT || 8080;

// Create Express application
const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = [
    'https://real-time-chat-application-client.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Middleware setup
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

// Handle preflight requests for CORS
app.options('*', cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// API routes
app.use('/api', router);

// Simple health check route
app.get('/', (req, res) => {
    res.json({ message: "Server running at " + PORT });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
});

// Socket.io setup
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
});

// Socket.io connection event
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
            console.log("Server running at http://localhost:" + PORT);
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });
