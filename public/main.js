
const userData = document.querySelector('.user-data');
const usernameInput = document.getElementById('usernameInput');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const chat = document.querySelector('.chat');
const chatArea = document.getElementById('chatArea');
const usersInfoArea = document.getElementById('usersInfoArea');
const roomTitle = document.getElementById('roomTitle');
const sendBtn = document.getElementById('sendBtn');
const msgInput = document.getElementById('msgInput');
const imageCard = document.querySelector('.card.image');
const captureVideoButton = document.querySelector('#captureBtn');
const screenshotButton = document.querySelector('#takeScreenshotBtn');
const sendImageBtn = document.querySelector('#sendImageBtn');
const imgPreview = document.querySelector('#imageArea #preview');
const video = document.querySelector('#imageArea video');
const canvas = document.querySelector('canvas');

let username = '';
let room = '';
let socket = null;

const join = () => {
  username = usernameInput.value || `anonymous${Math.ceil(Math.random() * 1000)}`;
  room = roomInput.value || 'general';
  chat.style.display = 'flex';
  userData.style.display = 'none';
  roomTitle.innerText = `${username} @ ${room}`;

  socket = io(); // == io('http://localhost:3000');
  socket.emit('chatInfo', { username, room });
  socket.on('chatMessage', data => chatArea.innerHTML += `<strong>${data.username}</strong>:  ${data.message}<br>`);
  socket.on('chatInfo', data => chatArea.innerHTML += `<em>${data.message}</em><br>`);
  socket.on('users', users => {
    usersInfoArea.innerHTML = '';
    users.forEach(user => usersInfoArea.innerHTML += '<em>' + user.username + '</em><br>');
  });
  socket.on('image', data => {
    chatArea.innerHTML += `<strong>${data.username}</strong>: <img height="150px" src="${data.image}"><br>`;
  });
};

const send = event => {
  if (event.keyCode == 13 || !event.keyCode) {
    socket.emit('chatMessage', { username, message: msgInput.value, room });
    msgInput.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;
  }
};

const sendImage = () => {
  imageCard.style.display = 'none';
  imgPreview.style.display = 'none';
  const dataURL = canvas.toDataURL("image/png");
  socket.emit('image', { username, room, image: dataURL });
  captureVideoButton.style.display = 'initial';
  sendImageBtn.style.display = 'none';
};

const captureVideo = () => {
  imageCard.style.display = 'initial';
  screenshotButton.style.display = 'initial';
  captureVideoButton.style.display = 'none';
  video.style.display = 'block';

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      screenshotButton.disabled = false;
      video.srcObject = stream;
    })
    .catch(console.log);
};

const takeScreenshot = () => {


  const vRatio = (canvas.height / video.videoHeight) * video.videoWidth;

  canvas.getContext('2d').drawImage(video, 0, 0, vRatio, canvas.height);
  imgPreview.width = vRatio;
  imgPreview.src = canvas.toDataURL('image/webp');
  video.style.display = 'none';
  screenshotButton.style.display = 'none';
  sendImageBtn.style.display = 'initial';
  imgPreview.style.display = 'initial';
};


sendBtn.addEventListener('click', send);
msgInput.addEventListener('keyup', send);
joinBtn.addEventListener('click', join);
captureVideoButton.addEventListener('click', captureVideo);
sendImageBtn.addEventListener('click', sendImage);
screenshotButton.addEventListener('click', takeScreenshot);
