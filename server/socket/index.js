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
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Online users
const onlineUser = new Set();

io.on('connection', async (socket) => {
  console.log("Connected User ", socket.id);

  try {
    const token = socket.handshake.auth.token;
    console.log('Received token:', token);

    // Fetch user details from token
    const user = await getUserDetailsFromToken(token);
    console.log('Fetched user details:', user);

    if (!user || !user._id) {
      throw new Error('User details are not valid or missing _id property.');
    }

    // Join socket room with user id
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    io.emit('onlineUser', Array.from(onlineUser));

    // Event listener for 'message-page'
    socket.on('message-page', async (userId) => {
      console.log('message-page userId', userId);
      const userDetails = await UserModel.findById(userId).select("-password");

      if (!userDetails) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      const payload = {
        _id: userDetails._id,
        name: userDetails.name,
        email: userDetails.email,
        profile_pic: userDetails.profile_pic,
        online: onlineUser.has(userId.toString())
      };

      socket.emit('message-user', payload);

      // Get previous messages
      const getConversationMessage = await ConversationModel.findOne({
        "$or": [
          { sender: user._id, receiver: userId },
          { sender: userId, receiver: user._id }
        ]
      }).populate('messages').sort({ updatedAt: -1 });

      socket.emit('message', getConversationMessage?.messages || []);
    });

    // Event listener for 'new message'
    socket.on('new message', async (data) => {
      console.log('new message data:', data);
      let conversation = await ConversationModel.findOne({
        "$or": [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender }
        ]
      });

      if (!conversation) {
        const createConversation = await ConversationModel.create({
          sender: data.sender,
          receiver: data.receiver
        });
        conversation = createConversation;
      }

      const message = new MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        msgByUserId: data.msgByUserId,
      });
      const saveMessage = await message.save();

      await ConversationModel.findByIdAndUpdate(conversation._id, {
        $push: { messages: saveMessage._id }
      });

      io.to(data.sender).emit('message', saveMessage);
      io.to(data.receiver).emit('message', saveMessage);

      const conversationSender = await getConversation(data.sender);
      const conversationReceiver = await getConversation(data.receiver);

      io.to(data.sender).emit('conversation', conversationSender);
      io.to(data.receiver).emit('conversation', conversationReceiver);
    });

    socket.on('sidebar', async (currentUserId) => {
      console.log("sidebar current user", currentUserId);

      const conversation = await getConversation(currentUserId);

      socket.emit('conversation', conversation);
    });

    socket.on('seen', async (msgByUserId) => {
      let conversation = await ConversationModel.findOne({
        "$or": [
          { sender: user._id, receiver: msgByUserId },
          { sender: msgByUserId, receiver: user._id }
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
    });

    socket.on('disconnect', () => {
      onlineUser.delete(user._id.toString());
      console.log('Disconnected User ', socket.id);
      io.emit('onlineUser', Array.from(onlineUser));
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
