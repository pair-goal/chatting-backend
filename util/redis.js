const redis = require('redis')
const logger= require('../util/logger');
const redisClient = redis.createClient(6379, process.env.REDIS_URI);

const User = require('../model/chatting').user;
const Conversation = require('../model/chatting').conversation;

redisClient.subscribe('newConversation');

redisClient.on('message', (channel, data) => {
  if(channel === "newConversation")
    newConversation(data);
});

async function newConversation(data) {
  const jsonData = JSON.parse(data);
  const participants = [];

  logger.info(`newConversation - ${data}`);

  jsonData.forEach(v => {
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

    jsonData.forEach(async v => {
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
