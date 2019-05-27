module.exports = io => {
  const Redis = require('ioredis');
  const mongoose = require('mongoose');
  const logger= require('../util/logger');
  const chatting = require('../model/chatting');
  const redisClient = new Redis(6379, process.env.REDIS_URI);
  const redisSub = new Redis(6379, process.env.REDIS_URI);

  const User = chatting.user;
  const Conversation = chatting.conversation;
  const Message = chatting.message;

  redisSub.subscribe('newUser');
  redisSub.subscribe('newConversation');
  redisSub.subscribe('sendMessage');

  redisSub.on('message', (channel, data) => {
    const jsonData = JSON.parse(data);

    if(channel === 'newUser')
      newUser(jsonData);
    if(channel === 'newConversation')
      newConversation(jsonData);
    if(channel === 'sendMessage')
      sendMessage(jsonData);
  });

  const newUser = async (data) => {
    const userNickname = data.nickname;

    try {
      const user = new User({
        nickname: userNickname,
        conversations: [],
      });
  
      await user.save();
    } catch (e) {
      logger.error(e.stack);
    }
  };

  const newConversation = async (data) => {
    logger.info(`newConversation - ${JSON.stringify(data)}`);

    const participants = [];

    data.forEach(v => {
      const participant = {
        nickname: v.nickname,
        title: v.title,
      };

      participants.push(participant);
    });

    try {
      const newConversation = new Conversation({
        participants,
      });

      const conversation = await newConversation.save();
      const conversationId = conversation._id;

      data.forEach(async v => {
        const userNickname = v.nickname;

        await User.updateOne(
          { nickname: userNickname },
          { $push: { conversations: conversationId } }
        );
      });
    } catch (e) {
      logger.error(e.stack);
    }
  };

  const sendMessage = async (data) => {
    logger.info(`newConversation - ${JSON.stringify(data)}`);

    const {id, content, nickname} = data;
    const roomClients = await io.of('/').in(id).clients();

    try {
      const newMessage = new Message({
        conversation_id: mongoose.Types.ObjectId(id),
        sender: nickname,
        content,
      });

      const message = await newMessage.save();

      if(roomClients.length === 2) {
        await redisClient.select(2);
        await redisClient.hmset(message._id, 'content', message.content, 'created_at', message.created_at);

        if(roomClients[0].nickname === nickname)
          io.to(roomClients[1].id).emit('sendMessage', {chtting_id: message._id});
        else
          io.to(roomClients[0].id).emit('sendMessage', {chtting_id: message._id});
      }
    } catch (e) {
      logger.error(e.stack);
    }
  };
};