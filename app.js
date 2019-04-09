const mongoose = require('mongoose');
const logger= require('./util/logger');
require('./util/redis');
require('dotenv').config();

if(process.env.NODE_ENV == 'development')
  process.env.REDIS_URI = 'localhost'

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => logger.info('connect to mongodb'))
  .catch(e => logger.error(e.stack));

const io = io => {
  io.on('connection', socket => {
    
  });
};

module.exports = io;