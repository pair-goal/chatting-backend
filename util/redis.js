const Redis = require('ioredis');
const logger= require('../util/logger');
const chatting = require('../model/chatting');
const redisClient = new Redis(6379, process.env.REDIS_URI);

const User = chatting.user;
const Conversation = chatting.conversation;

redisClient.subscribe('newConversation');

redisClient.on('message', (channel, data) => {
  const jsonData = JSON.parse(data);

  if(channel === 'newConversation')
    newConversation(jsonData);
  if(channel === 'sendMessage')
    sendMessage(jsonData);
});

async function newConversation(data) {
  const participants = [];

  logger.info(`newConversation - ${data}`);

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
      try {
        const userNickname = v.nickname;
        const count = await User.countDocuments().where('nickname').equals(userNickname);

        if(count === 0) {
          const user = new User({
            nickname: userNickname,
            conversations: [conversationId],
          });

          await user.save();
        } else {
          await User.updateOne(
            { nickname: userNickname },
            { $push: { conversations: conversationId } }
          );
        }
      } catch (e) {
        logger.error(e.stack);
      }
    });
  } catch (e) {
    logger.error(e.stack);
  }
}
