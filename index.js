const express = require('express');
const path = require('path');
const http = require('http')
const socketIo = require('socket.io');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const io = socketIo(server);
const users = new Map();

io.on('connection', client => {
  client.on('chatInfo', data => {
    client.join(data.room);
    users.set(client.id, data);
    client.to(data.room).broadcast.emit('chatInfo', { message: `${data.username} connected.` });
    io.to(data.room).emit('users', Array.from(users.values()).filter(user => user.room === data.room));
  });

  client.on('chatMessage', data => {
    const { room } = users.get(client.id);
    io.to(room).emit('chatMessage', data);
  });

  client.on('disconnect', () => {
    try {
      const { username, room } = users.get(client.id);
      users.delete(client.id);
      io.to(room).emit('chatInfo', { message: `${username} disconnected.` });
      io.to(room).emit('users', Array.from(users.values()));
    } catch { }
  });

  client.on('image', imageData => {
    try {
      const { username, room } = users.get(client.id);
      io.to(room).emit('image', imageData);
    } catch (e) {
      console.log(e);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(3000, () => {
  console.log(`App listening on port ${port}`);

})