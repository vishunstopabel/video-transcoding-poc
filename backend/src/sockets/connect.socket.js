const { Server } = require("socket.io");
const { getClient } = require("../config/redisConnet");

let io;

const SocketIo = async (httpServer) => {
  const client = getClient();
  io = new Server(httpServer, {
    cors: "*", //
    methods: ["GET", "POST"],
    credentials: true,
  });
  io.use(async (socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
      const token = getCookieValue(cookies, "authToken");
      if (!token) {
        console.error("Authentication error: Token missing");
        return next(new Error("Authentication error: Token missing"));
      }
      try {
        const user = await heleper.verifyJwt(token);
        console.log(user);
        socket.user = user;
      } catch (error) {
        console.error("Authentication error: Invalid token", error.message);
        next(new Error("Authentication error: Invalid token"));
      }
    } else {
      socket.user = null;
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log(`new user conneted ${socket.user._id}`);
    client.sadd(
      `socket:${socket.user._id}`,
      socket.id
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `$disconnected: ${socket.user._id} due to ${reason}`
      );
     client.srem(
      `socket:${socket.user._id}`,
      socket.id
    );
    });
  });
  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized. Call socketIO() first.");
  }
  return io;
};

module.exports = { SocketIo, getIo };
