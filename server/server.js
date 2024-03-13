const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const parentDir = path.join(__dirname, '..') + '/';

app.use(express.static(parentDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(parentDir, '/lobby_placeholder/join.html'));
});

let users = {};
io.on('connection', (socket) => {
    socket.on('new user', (username) => {
        users[socket.id] = username;
        io.emit('user list', Object.values(users));
    });

    socket.on('chat message', (msg) => {
        const username = users[socket.id] || 'Anonymous';
        io.emit('chat message', `${username}: ${msg}`);
    });

    socket.on('button clicked', () => {
        const newText = "Clicked!";
        io.emit('button change', newText);
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});