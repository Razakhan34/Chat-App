const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public/");
app.use(express.static(publicDirectoryPath));

// let count = 0;
io.on("connection", (socket) => {
  console.log("new websocket connected");
  // socket.emit("message", generateMessage("Welcome"));

  socket.on("join", ({ username, room }, callback) => {
    // socket.emit(),io.emit(),socket.broadcast.emit() we have used
    // io.to().emit(),socket.boardcast.to().emit()
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Welcome", "Admin"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined!!`, user.username)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });
  // io.emit("updatedCount", count);
  // socket.on("increment", () => {
  //   count++;
  //   io.emit("updatedCount", count);
  // });

  // for sending message all client but not current socket
  // socket.broadcast.emit("message", generateMessage("A new user joined"));

  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("Profinity is not allowed!!!");
    }
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(msg, user.username));
    callback();
  });
  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        `https://www.google.com/maps?q=${latitude},${longitude}`,
        user.username
      )
    );
    callback("Location Shared!!");
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      socket.broadcast
        .to(user.room)
        .emit("message", generateMessage(`${user.username} has just left`));

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on ${port} number`);
});
