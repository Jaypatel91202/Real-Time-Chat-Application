const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://jay-chat-application.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Online users
const onlineUsers = new Set();

io.on('connection', async (socket) => {
  console.log("User connected:", socket.id);

  try {
    const token = socket.handshake.auth.token;
    console.log('Received token:', token);

    // Fetch user details from token
    const user = await getUserDetailsFromToken(token);
    if (!user || !user._id) {
      throw new Error('Invalid user details.');
    }

    // Join socket room with user id
    socket.join(user._id.toString());
    onlineUsers.add(user._id.toString());

    io.emit('onlineUsers', Array.from(onlineUsers));

    // Event listener for 'message-page'
    socket.on('message-page', async (userId) => {
      try {
        console.log('Fetching user details for:', userId);
        const userDetails = await UserModel.findById(userId).select("-password");

        if (!userDetails) {
          throw new Error(`User with ID ${userId} not found.`);
        }

        const payload = {
          _id: userDetails._id,
          name: userDetails.name,
          email: userDetails.email,
          profile_pic: userDetails.profile_pic,
          online: onlineUsers.has(userId.toString()),
        };

        socket.emit('message-user', payload);

        // Get previous messages
        const conversation = await ConversationModel.findOne({
          "$or": [
            { sender: user._id, receiver: userId },
            { sender: userId, receiver: user._id },
          ]
        }).populate('messages').sort({ updatedAt: -1 });

        socket.emit('message', conversation?.messages || []);
      } catch (error) {
        console.error('Error in message-page event:', error.message);
      }
    });

    // Event listener for 'new message'
    socket.on('new message', async (data) => {
      try {
        console.log('New message data:', data);
        
        // Check if the message is already processed
        let conversation = await ConversationModel.findOne({
          "$or": [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender },
          ]
        });

        if (!conversation) {
          conversation = await ConversationModel.create({
            sender: data.sender,
            receiver: data.receiver,
          });
        }

        const message = new MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          msgByUserId: data.msgByUserId,
        });

        const savedMessage = await message.save();

        await ConversationModel.findByIdAndUpdate(conversation._id, {
          $push: { messages: savedMessage._id }
        });

        // Emit message to sender and receiver
        io.to(data.sender).emit('new-message', savedMessage);
        io.to(data.receiver).emit('new-message', savedMessage);

        const conversationSender = await getConversation(data.sender);
        const conversationReceiver = await getConversation(data.receiver);

        io.to(data.sender).emit('conversation', conversationSender);
        io.to(data.receiver).emit('conversation', conversationReceiver);
      } catch (error) {
        console.error('Error in new message event:', error.message);
      }
    });

    // Event listener for 'sidebar'
    socket.on('sidebar', async (currentUserId) => {
      try {
        console.log("Fetching sidebar conversation for user:", currentUserId);
        const conversation = await getConversation(currentUserId);
        socket.emit('conversation', conversation);
      } catch (error) {
        console.error('Error in sidebar event:', error.message);
      }
    });

    // Event listener for 'seen'
    socket.on('seen', async (msgByUserId) => {
      try {
        console.log("Marking messages as seen for user:", msgByUserId);
        const conversation = await ConversationModel.findOne({
          "$or": [
            { sender: user._id, receiver: msgByUserId },
            { sender: msgByUserId, receiver: user._id },
          ]
        });

        if (!conversation) {
          throw new Error(`Conversation not found between user ${user._id} and ${msgByUserId}.`);
        }

        await MessageModel.updateMany({
          _id: { $in: conversation.messages },
          msgByUserId: msgByUserId
        }, {
          seen: true
        });

        const conversationSender = await getConversation(user._id);
        const conversationReceiver = await getConversation(msgByUserId);

        io.to(user._id.toString()).emit('conversation', conversationSender);
        io.to(msgByUserId).emit('conversation', conversationReceiver);
      } catch (error) {
        console.error('Error in seen event:', error.message);
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(user._id.toString());
      console.log('User disconnected:', socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers));
    });

  } catch (error) {
    console.error('Error in socket connection:', error.message);
    socket.disconnect(true);
  }
});

module.exports = {
  app,
  server
};
