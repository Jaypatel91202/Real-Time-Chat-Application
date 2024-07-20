// Import required modules
const express = require('express');
const cors = require('cors');

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: 'https://real-time-chat-application-client.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Sample route
app.post('/api/email', (req, res) => {
  const email = req.body.email;
  // Perform necessary operations with email
  console.log(`Received email: ${email}`);

  // Respond to the client
  res.status(200).json({ message: 'Email received successfully' });
});

// Handle non-existent routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
