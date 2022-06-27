//adduser,removeUser,getUsers,getUsersInRoom
const users = [];
const addUser = ({ id, username, room }) => {
  // clean the field
  username = username.trim();
  room = room.trim().toLowerCase();
  //validate the field
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }
  // check the username alerady exists in room
  const userExisting = users.find((currUser) => {
    return currUser.room === room && currUser.username === username;
  });
  if (userExisting) {
    return {
      error: "User is in room already",
    };
  }
  // add the user
  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const findingUserIndex = users.findIndex((currUser) => currUser.id === id);
  if (findingUserIndex !== -1) {
    return users.splice(findingUserIndex, 1)[0];
  }
};

const getUser = (id) => {
  const findUser = users.find((currUser) => currUser.id === id);
  return findUser;
};
const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((currUser) => currUser.room === room);
  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
