const mongoose = require('mongoose');
const socketio = require('./util/socket');
const logger= require('./util/logger');
require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => logger.info('connect to mongodb'))
  .catch(e => logger.error(e.stack));

const io = io => {
  io.on('connection', socket => {
    socketio.init(socket);
    socket.on('sendMessage', (data, callback) => socketio.sendMessage(data, callback));
  });
};

module.exports = io;