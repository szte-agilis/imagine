const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const parentDir = path.join(__dirname, '..');
const LOBBY_STATIC_ROOT = path.join(parentDir, '/lobby_placeholder');
const GAME_STATIC_ROOT = path.join(parentDir, '/gamefield');
const CARDS_STATIC_ROOT = path.join(parentDir, '/cards');
const COMMON_STATIC = path.join(parentDir, '/common');

app.use(express.static(parentDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(LOBBY_STATIC_ROOT, '/join.html'));
});

app.use(require('body-parser').json());

const apiRouter = express.Router();

apiRouter.post('/join', (req, res) => {
    const { name, lobbyId, categoryId } = req.body;
    io.emit('chat message', `${name} joined the lobby`);
});

app.use('/api', apiRouter);

let users = {};
let drawerSocketId = {};
let drawerAssigned = {};
let lobbies = {};
let buttonState = 'Click me!';
io.on('connection', (socket) => {
    socket.emit('button change', buttonState);

    socket.on('new user', (username, lobbyId) => {
        users[socket.id] = username;
        socket.join(lobbyId);
        if (!lobbies[lobbyId]) {
            lobbies[lobbyId] = {};
        }
        lobbies[lobbyId][socket.id] = username;
        if (!drawerAssigned[lobbyId]) {
            drawerAssigned[lobbyId] = true;
            drawerSocketId[lobbyId] = socket.id;
            socket.emit('Drawer', true);
            io.to(lobbyId).emit(
                'chat message',
                `${username} is now the drawer`
            );
        } else {
            socket.emit('Drawer', false);
        }
        console.log(drawerAssigned, drawerSocketId);

        io.to(lobbyId).emit('user list', Object.values(lobbies[lobbyId]));
    });

    socket.on('user connect', (username, lobbyId) => {
        users[socket.id] = username;
        socket.join(lobbyId);
        if (!lobbies[lobbyId]) {
            lobbies[lobbyId] = {};
        }
        lobbies[lobbyId][socket.id] = username;
        if (!drawerAssigned[lobbyId]) {
            drawerAssigned[lobbyId] = true;
            drawerSocketId[lobbyId] = socket.id;
            socket.emit('Drawer', true);
            io.to(lobbyId).emit(
                'chat message',
                `${username} is now the drawer`
            );
        } else {
            socket.emit('Drawer', false);
        }
        console.log(drawerAssigned, drawerSocketId);

        io.to(lobbyId).emit('user list', Object.values(lobbies[lobbyId]));
    });

    socket.on('chat message', (msg, lobbyId) => {
        const username = users[socket.id] || 'Anonymous';
        io.to(lobbyId).emit('chat message', `${username}: ${msg}`);
    });

    socket.on('button clicked', (username, lobbyId) => {
        buttonState = `${username} clicked the button`;
        // Broadcast the new button text, including the username of the drawer who clicked
        io.to(lobbyId).emit('button change', `${username} clicked the button`);
        console.log(username, lobbyId);
    });

    socket.on('pass drawer', (lobbyId) => {
        const userIds = Object.keys(lobbies[lobbyId]);
        const currentDrawerIndex = userIds.indexOf(drawerSocketId[lobbyId]);
        let nextDrawerIndex = (currentDrawerIndex + 1) % userIds.length;
        drawerSocketId[lobbyId] = userIds[nextDrawerIndex];

        userIds.forEach((id) => {
            io.to(id).emit('Drawer', false);
        });

        socket.to(drawerSocketId[lobbyId]).emit('Drawer', true);
        const newDrawerUsername = users[drawerSocketId];
        io.to(lobbyId).emit(
            'chat message',
            `${newDrawerUsername} is now the drawer`
        ); // Announce the new drawer
    });

    socket.on('disconnect', (lobbyId) => {
        if (drawerSocketId[lobbyId] === socket.id) {
            const remainingUserIds = Object.keys(lobbies[lobbyId]).filter(
                (id) => id !== socket.id
            );
            if (remainingUserIds.length > 0) {
                drawerSocketId[lobbyId] = remainingUserIds[0];
                const newDrawerUsername = users[drawerSocketId[lobbyId]];
                socket.to(drawerSocketId[lobbyId]).emit('Drawer', true);
                io.to(lobbyId).emit(
                    'chat message',
                    `${newDrawerUsername} is now the drawer`
                );
            } else {
                delete drawerAssigned[lobbyId];
                delete drawerSocketId[lobbyId];
            }
        }

        delete users[socket.id];
        io.to(lobbyId).emit('user list', Object.values(lobbies[lobbyId]));
    });
});

drawer = () => {
    return true;
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
