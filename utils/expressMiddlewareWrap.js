const expressMiddlewareWrap = (expressMiddleware) => (socket, next) => 
  expressMiddleware(socket.request, {}, next);

module.exports = {expressMiddlewareWrap}