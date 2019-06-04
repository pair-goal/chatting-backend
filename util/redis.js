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
  redisSub.subscribe('updateDiary');

  redisSub.on('message', (channel, data) => {
    const jsonData = JSON.parse(data);

    if(channel === 'newUser')
      newUser(jsonData);
    if(channel === 'newConversation')
      newConversation(jsonData);
    if(channel === 'sendMessage')
      sendMessage(jsonData);
    if(channel === 'updateDiary')
      updateDiary(jsonData);
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

      redisClient.publish('newConversation', {
        goal_id: v.id,
        conversation_id: conversationId
      })

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

    try {
      const newMessage = new Message({
        conversation_id: mongoose.Types.ObjectId(id),
        sender: nickname,
        content,
      });

      const message = await newMessage.save();

      io.of('/').in(id).clients(async (err, clients) => {
        if(err)
          throw new Error(e);

        if(clients.length === 2 || (clients.length === 1 && clients[0] !== nickname)) {
          await redisClient.select(2);
          await redisClient.hmset(message._id, 'content', message.content,
            'sender', nickname, 'created_at', message.created_at);
  
          if(clients[0] === nickname)
            io.to(clients[1]).emit('sendMessage', message._id);
          else
            io.to(clients[0]).emit('sendMessage', message._id);
        }
      });
    } catch (e) {
      logger.error(e.stack);
    }
  };

  const updateDiary = async (data) => {
    const {id, comment, score, nickname} = data;

    const content = `오늘은 목표를 위해서 열심히 '${comment}' 를 했어요. 오늘 제 점수는 5점 만점에 ${score}점!`;

    sendMessage({
      id,
      content,
      nickname
    });
  }
};