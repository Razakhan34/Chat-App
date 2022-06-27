const socket = io();
// socket.on("updatedCount", (count) => {
//   console.log(`Count has been updated`, count);
// });
// const incrementBtn = document.querySelector(".incrementBtn");
// incrementBtn.addEventListener("click", () => {
//   socket.emit("increment");
// });

// elements
const messageForm = document.querySelector(".myform");
const messageInput = messageForm.querySelector(".message");
const messageButton = messageForm.querySelector(".btn");
const locationBtn = document.querySelector(".location-btn");
const messageContainer = document.querySelector(".messages");
const sidebar = document.querySelector("#sidebar");

// templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

const autoScroll = () => {
  // find last element in chat
  const newMessage = messageContainer.lastElementChild;

  // finding total height of new message
  const newMessageStyle = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = messageContainer.offsetHeight;

  const totalContainerHeight = messageContainer.scrollHeight;
  // find how far i ahve scrolled?
  const scrollOffset = messageContainer.scrollTop + visibleHeight;

  // if (totalContainerHeight - newMessageHeight <= scrollOffset) {
  // }
  if (totalContainerHeight - newMessageHeight <= scrollOffset) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
};

// url paramaters
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", ({ text, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    message: text,
    createdAt: moment(createdAt).format("h:mm A"),
    username,
  });
  messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});
socket.on("locationMessage", ({ url, createdAt, username }) => {
  const html = Mustache.render(locationTemplate, {
    url,
    createdAt: moment(createdAt).format("h:mm A"),
    username,
  });
  messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

// getting event of roomData to show all user name in current room
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = html;
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable form until message send
  messageButton.setAttribute("disabled", "disabled");
  const message = messageInput.value;
  socket.emit("sendMessage", message, (error) => {
    //enable the form if message sent
    messageButton.removeAttribute("disabled");
    // clearing the value and focusing input again
    messageInput.value = "";
    messageInput.focus();
    if (error) {
      return alert(error);
    }
    console.log("Delivered");
  });
});
locationBtn.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("your browser doesn't support geolocation");
  }
  // disabled the button before sending location because it takes little time
  locationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((current) => {
    const { latitude, longitude } = current.coords;
    socket.emit("sendLocation", { latitude, longitude }, (acknowledgemsg) => {
      // unable the location button after sending location successfully
      locationBtn.removeAttribute("disabled");
      console.log(acknowledgemsg);
    });
  });
  // console.log(findingLocation());
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    window.location.href = "/";
  }
});
