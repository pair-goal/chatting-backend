const mongoose = require('mongoose');
const logger= require('./util/logger');
const Redis = require('ioredis');
const redisClient = new Redis(6379, process.env.REDIS_URI);
require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => logger.info('connect to mongodb'))
  .catch(e => logger.error(e.stack));

const io = io => {
  io.on('connection', socket => {
    redisClient.get('foo').then(result => console.log(result)).catch(e => console.log(e));
  });
};

module.exports = io;