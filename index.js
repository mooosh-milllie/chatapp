const {Server} = require('socket.io');
require('dotenv');
const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const helmet = require('helmet');
const cors = require('cors');
const authRouter = require('./routers/authRouter');
const sessionMiddleware = require('./middlewares/sessionMiddleware');
const { expressMiddlewareWrap } = require('./utils/expressMiddlewareWrap');
const corsConfig = require('./utils/corsConfig');
const { authUserSocket, addFriend, initializeUser, onDisconnect, directMessage } = require('./middlewares/socketAuthMiddleware');

const io = new Server(httpServer, {
  cors: corsConfig
});
app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json())
app.use(sessionMiddleware)
app.use('/auth', authRouter);

io.use(expressMiddlewareWrap(sessionMiddleware));
io.use(authUserSocket)
io.on('connect', (socket) => {
  initializeUser(socket);
  socket.on('add_friend', (friendUsername, cb) => 
    addFriend(socket, friendUsername, cb)
  );
  socket.on('directMessage', (message) => {
    console.log(message);
    directMessage(socket, message);
  })
  socket.on('createGroup', (groupName) => {
    createChatGroup(socket, groupName);
  })
  socket.on('disconnecting', async () => {
    return onDisconnect(socket);
  })
})

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log('Listening on PORT:' + PORT)
})
