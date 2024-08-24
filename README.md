Real-Time Chat Application
A scalable and robust real-time chat application built with modern web technologies to facilitate seamless communication.

Features

Real-Time Messaging: Instant delivery of messages using Socket.io for a smooth chat experience.
One-on-One and Group Chats: Supports private and group conversations for versatile communication.
User Authentication: Secure login and registration using JSON Web Tokens (JWT).
Typing Indicators: Real-time feedback showing when a user is typing.
Read Receipts: Notifications when messages are read, enhancing communication transparency.
Message Notifications: In-app and browser notifications for new messages.
Responsive Design: Optimized for both desktop and mobile devices.


Technologies Used

Frontend: React.js
Backend: Node.js, Express.js
Real-Time Communication: Socket.io
Database: MongoDB
Authentication: JSON Web Tokens (JWT)
Deployment: Vercel (frontend), Render (backend)
Getting Started
Follow these instructions to set up and run the project locally.

Prerequisites
Node.js (v14.x or later)
npm (v6.x or later)
MongoDB (locally installed or use a cloud-based MongoDB service like MongoDB Atlas)
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/Jaypatel91202/Real-Time-Chat-Application.git
Navigate into the project directory:

bash
Copy code
cd Real-Time-Chat-Application
Install dependencies for both the client and server:

bash
Copy code
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
Environment Variables
Create a .env file in the server directory and add the following variables:

env
Copy code
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Replace your_mongodb_connection_string with your MongoDB URI and your_jwt_secret with a secret key of your choice for JWT.

Running the Application
Start the MongoDB server (if running locally).

Start the server:

bash
Copy code
cd server
npm start
Start the client:

bash
Copy code
cd ../client
npm start
Open your browser and go to http://localhost:3000

Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any feature additions or bug fixes.

License
This project is open-source and available under the MIT License.
