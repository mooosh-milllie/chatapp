const pool = require('../utils/db');
const redisClient = require('../utils/redisClient');

module.exports.authUserSocket = async (socket, next) => {
  if (!socket.request.session?.user) {
    next(new Error('Not Authorized'))
  } else {
    next()
  };
}

module.exports.initializeUser = async(socket) => {
  socket.user = {...socket.request.session.user};
  socket.join(socket.user.userid);
  // Set User in the cache as online
  await redisClient.hset(
    `userid:${socket.user.username}`, 
    'userid', socket.user.userid,
    'connected',true
  );
  const friendList = await redisClient.lrange(
    `friends:${socket.user.username}`,
    0,
    -1
  );

  const parsedFriendList = await parseFriendList(friendList);
  if (parsedFriendList.length > 0) {
    const friendRooms = parsedFriendList.map(friend => friend.userid);
    socket.to(friendRooms).emit('connected', true, socket.user.username);
    socket.emit('friends', parsedFriendList);
  }

  const getMessages = await redisClient.lrange(
    `chat:${socket.user.userid}`, 0, -1
  );
  
  if (getMessages?.length > 0) {
    const parseMessages = getMessages.map((message) => {
      return JSON.parse(message);
    });
    socket.emit('messages', parseMessages);
  }
}

module.exports.addFriend = async(socket, friendUsername, cb) => {
  if (friendUsername === socket.user.username) {
    cb({done: false, errorMessage: 'cannot add self!'});
    return;
  }
  const friend = await redisClient.hgetall(
    `userid:${friendUsername}`
  )
  if (!friend.userid) {
    cb({done: false, errorMessage: 'Username does not exist!'});
    return;
  }
  const currentFriendList = await redisClient.lrange(
    `friends:${socket.user.username}`,
    0,
    -1
  )

  const checkDuplicateFriend = currentFriendList.find(friend => {
    const friendToObj = JSON.parse(friend);
    return friendToObj.username === friendUsername
  })
  if (checkDuplicateFriend) {
    cb({done: false, errorMessage: 'Friend already added!'});
    return;
  }
  const newFriend = JSON.stringify({username: friendUsername, userid: friend.userid});
  const addedNewFriend = JSON.stringify({username: socket.user.username, userid: socket.user.userid});
  await redisClient.lpush(
    `friends:${socket.user.username}`,
    newFriend
  )
  await redisClient.lpush(
    `friends:${friendUsername}`,
    addedNewFriend
  )
  cb({done: true, newFriend: {
    username: friendUsername,
    userid: friend.userid,
    connected: friend.connected
  }})
  const addedFriend = {
    username: socket.user.username, 
    userid: socket.user.userid,
    connected: true
  };
  if (friend.connected === 'true') {
    socket.to(friend.userid).emit('add_friend', addedFriend);
  }
}

module.exports.onDisconnect = async(socket) => {
  await redisClient.hset(
    `userid:${socket.user.username}`,
    'connected', false
  )
  const friendList = await redisClient.lrange(`friends:${socket.user.username}`, 0, -1);

  const parsedFriendList = await parseFriendList(friendList);

  const friendRoom = parsedFriendList.map(friend => friend.userid);

  socket.to(friendRoom).emit('connected', false, socket.user.username);
}

const parseFriendList = async (friendList) => {
  const newFriendList = [];
  for (let friend of friendList) {
    const parsedFriend = JSON.parse(friend);
    const friendConnected = await redisClient.hget(`userid:${parsedFriend.username}`, 'connected');

    newFriendList.push({...parsedFriend, connected: friendConnected})
  }
  return newFriendList;
}

module.exports.directMessage = async(socket, message) => {
  const messageDetails = {...message, from: socket.user.userid};

  const stringifyMessageDetails = JSON.stringify(messageDetails);
  await redisClient.lpush(`chat:${messageDetails.to}`, stringifyMessageDetails);
  await redisClient.lpush(`chat:${messageDetails.from}`, stringifyMessageDetails);

  socket.to(messageDetails.to).emit('directMessage', messageDetails);
}