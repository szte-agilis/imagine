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
let drawerSocketId = null;
let drawerAssigned = false;
let buttonState = 'Click me!';
let nextUserId = 1;
io.on('connection', (socket) => {
    socket.emit('button change', buttonState);

    socket.on('new user', (username) => {
        const userId = nextUserId++;
        users[socket.id] = { username, id: userId };
        if (!drawerAssigned) {
            drawerAssigned = true;
            drawerSocketId = socket.id;
            socket.emit('Drawer', true);
            io.emit('chat message', `${username} is now the drawer`);
        } else {
            socket.emit('Drawer', false);
        }

        io.emit('user list', Object.values(users).map(user => user.username));
    });

    socket.on('chat message', (msg) => {
        const username = users[socket.id]?.username || 'Anonymous';
        io.emit('chat message', `${username}: ${msg}`);
    });

    socket.on('button clicked', (username) => {
        buttonState = `${username} clicked the button`;
        // Broadcast the new button text, including the username of the drawer who clicked
        io.emit('button change', `${username} clicked the button`);
    });

    socket.on('pass drawer', () => {
        const userIds = Object.keys(users);
        const currentDrawerIndex = userIds.indexOf(drawerSocketId);
        let nextDrawerIndex = (currentDrawerIndex + 1) % userIds.length;
        drawerSocketId = userIds[nextDrawerIndex];

        userIds.forEach((id) => {
            io.to(id).emit('Drawer', false);
        });

        io.to(drawerSocketId).emit('Drawer', true);
        const newDrawerUsername = users[drawerSocketId]?.username;
        io.emit('chat message', `${newDrawerUsername} is now the drawer`); // Announce the new drawer
    });

    socket.on('disconnect', () => {
        if (drawerSocketId === socket.id) {
            const remainingUserIds = Object.keys(users).filter(
                (id) => id !== socket.id
            );
            if (remainingUserIds.length > 0) {
                drawerSocketId = remainingUserIds[0];
                const newDrawerUsername = users[drawerSocketId]?.username;
                io.to(drawerSocketId).emit('Drawer', true);
                io.emit(
                    'chat message',
                    `${newDrawerUsername} is now the drawer`
                );
            } else {
                drawerAssigned = false;
                drawerSocketId = null;
            }
        }

        delete users[socket.id];
        io.emit('user list', Object.values(users).map(user => user.username));
    });
});

drawer = () => {
    return true;
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
