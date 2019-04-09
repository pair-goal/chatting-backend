const mongoose = require('mongoose');
const redis = require('redis');
const logger= require('./util/logger');
require('dotenv').config();

if(process.env.NODE_ENV == 'development')
  process.env.REDIS_URI = 'localhost'

const redisClient = redis.createClient(6379, process.env.REDIS_URI);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => logger.info('connect to mongodb'))
  .catch(e => logger.error(e));

const io = io => {
  io.on('connection', socket => {
    
  });
};

module.exports = io;