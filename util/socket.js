const Redis = require('ioredis');
const redisClient = new Redis(6379, process.env.REDIS_URI);
const logger = require('../util/logger');

const User = require('../model/chatting').user;

const init = async socket => {
  try {
    const {nickname} = socket.handshake.query;
    const user = await User.findOne().where('nickname').equals(nickname);

    if(user === null)
      return;

    user.conversations.forEach(v => {
      socket.join(v);
    });
  } catch (e) {
    logger.error(e.stack);
  }
};

const sendMessage = callback => {
  callback();
};

module.exports = {
  init,
  sendMessage,
}