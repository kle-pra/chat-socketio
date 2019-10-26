
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
const imageArea = document.querySelector('.image');
const captureVideoButton = document.querySelector('#captureBtn');
const screenshotButton = document.querySelector('#takeScreenshotBtn');
const sendImageBtn = document.querySelector('#sendImageBtn');
const cancelImageBtn = document.querySelector('#cancelImageBtn');
const imgPreview = document.querySelector('#imageArea #preview');
const video = document.querySelector('#imageArea video');
const canvas = document.querySelector('canvas');

let username = '';
let room = '';
let socket = null;
let streamRef;

sendBtn.addEventListener('click', send);
msgInput.addEventListener('keyup', send);
joinBtn.addEventListener('click', join);
captureVideoButton.addEventListener('click', captureVideo);
sendImageBtn.addEventListener('click', sendImage);
screenshotButton.addEventListener('click', takeScreenshot);
cancelImageBtn.addEventListener('click', cancelImage);


function join() {
  username = usernameInput.value || `anonymous${Math.ceil(Math.random() * 1000)}`;
  room = roomInput.value || 'general';
  chat.style.display = 'flex';
  userData.style.display = 'none';
  roomTitle.innerText = `${username} @ ${room}`;

  socket = io(); // == io('http://localhost:3000');

  socket.emit('chatInfo', { username, room });

  socket.on('chatMessage', data => {
    chatArea.innerHTML += `<strong>${data.username}</strong>:  ${data.message}<br>`
    chatArea.scrollTop = chatArea.scrollHeight;
  });

  socket.on('chatInfo', data => {
    chatArea.innerHTML += `<em>${data.message}</em><br>`;
  });

  socket.on('users', users => {
    usersInfoArea.innerHTML = '';
    users.forEach(user => usersInfoArea.innerHTML += '<em>' + user.username + '</em><br>');
  });

  socket.on('image', data => {
    chatArea.innerHTML += `<strong>${data.username}</strong>: <img style="vertical-align:middle; padding: 1rem" height="150px" src="${data.image}"><br>`;
    chatArea.scrollTop = chatArea.scrollHeight;

  });
};

function send(event) {
  if ((event.keyCode == 13 || !event.keyCode) && msgInput.value) {
    socket.emit('chatMessage', { username, message: msgInput.value, room });
    msgInput.value = '';
  }
};

function sendImage() {
  stopStream();
  imageArea.style.display = 'none';
  imgPreview.style.display = 'none';
  const dataURL = canvas.toDataURL("image/png");
  socket.emit('image', { username, room, image: dataURL });
  captureVideoButton.style.display = 'initial';
  cancelImageBtn.style.display = 'none';
  sendImageBtn.style.display = 'none';
  sendBtn.style.display = 'initial';
  msgInput.parentElement.style.display = 'initial';
};

function cancelImage() {
  stopStream();
  imageArea.style.display = 'none';
  imgPreview.style.display = 'none';
  captureVideoButton.style.display = 'initial';
  sendImageBtn.style.display = 'none';
  cancelImageBtn.style.display = 'none';
  screenshotButton.style.display = 'none';
  sendBtn.style.display = 'initial';
  msgInput.parentElement.style.display = 'initial';
};

function captureVideo() {
  imageArea.style.display = 'initial';
  screenshotButton.style.display = 'initial';
  cancelImageBtn.style.display = 'initial';
  captureVideoButton.style.display = 'none';
  video.style.display = 'block';
  sendBtn.style.display = 'none';
  msgInput.parentElement.style.display = 'none';

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      streamRef = stream;
      screenshotButton.disabled = false;
      video.srcObject = stream;
    })
    .catch(console.log);
};

function takeScreenshot() {
  const vRatio = (canvas.height / video.videoHeight) * video.videoWidth;
  canvas.getContext('2d').drawImage(video, 0, 0, vRatio, canvas.height);
  imgPreview.width = vRatio;
  imgPreview.src = canvas.toDataURL('image/webp');
  video.style.display = 'none';
  screenshotButton.style.display = 'none';
  sendImageBtn.style.display = 'initial';
  imgPreview.style.display = 'initial';
};



function stopStream() {
  if (streamRef.stop) {
    streamRef.stop();
  }
  else {
    streamRef.getVideoTracks()[0].stop();
  }
}

