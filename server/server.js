const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(
    server,
    process.env['NODE_ENV'] === 'production'
        ? {}
        : {
              cors: {
                  origin: '*',
              },
          }
);

const parentDir = path.join(__dirname, '..');
const LOBBY_STATIC_ROOT = path.join(parentDir, '/lobby_placeholder');
const GAME_STATIC_ROOT = path.join(parentDir, '/gamefield');
const CARDS_STATIC_ROOT = path.join(parentDir, '/cards');
const COMMON_STATIC = path.join(parentDir, '/common');

app.use(require('cors')());

class Lobby {
    constructor(lobbyId) {
        this.lobbyName = lobbyId;
        /**
         * @type {Record<string, SocketIO.Socket[]>}
         */
        this.players = {};
    }

    addUser(userName, socket) {
        if (!this.players[userName]) this.players[userName] = [];
        this.players[userName].push(socket);

        socket.on('chat message', (msg) => {
            console.log('chat message: ' + msg);
            this.broadcast(
                'chat message',
                `chat message in ${this.roomId} from ${userName}: ${msg}`
            );
        });

        socket.on('disconnect', () => {
            this.removeUser(userName);
        });

        socket.join(this.lobbyName);
    }

    removeUser(userId) {
        delete this.players[userId];
        // TODO: socket.remove(lobbyId)
    }

    broadcast(channel, payload) {
        io.to(this.lobbyId).emit(channel, payload);
    }
}

const lobbies = {};

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('join', ({ lobbyID, userName }) => {
        console.log('join', { lobbyID, userName, lobby: lobbies[lobbyID] });
        if (!lobbies[lobbyID]) lobbies[lobbyID] = new Lobby(lobbyID);
        const lobby = lobbies[lobbyID];
        lobby.addUser(userName, socket);

        console.log(lobby);
    });
});

app.use(express.static(parentDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(LOBBY_STATIC_ROOT, '/join.html'));
});

app.all('*', (req, res) => {
    res.status(404).sendFile(path.join(COMMON_STATIC, '/404.html'));
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).sendFile(path.join(COMMON_STATIC, '/500.html'));
});

// let users = {};
// let drawerSocketId = null;
// let drawerAssigned = false;
// let buttonState = 'Click me!';
// io.on('connection', (socket) => {
//     socket.emit('button change', buttonState);

//     socket.on('new user', (username) => {
//         users[socket.id] = username;
//         if (!drawerAssigned) {
//             drawerAssigned = true;
//             drawerSocketId = socket.id;
//             socket.emit('Drawer', true);
//             io.emit('chat message', `${username} is now the drawer`);
//         } else {
//             socket.emit('Drawer', false);
//         }

//         io.emit('user list', Object.values(users));
//     });

//     socket.on('chat message', (msg) => {
//         const username = users[socket.id] || 'Anonymous';
//         io.emit('chat message', `${username}: ${msg}`);
//     });

//     socket.on('button clicked', (username) => {
//         buttonState = `${username} clicked the button`;
//         // Broadcast the new button text, including the username of the drawer who clicked
//         io.emit('button change', `${username} clicked the button`);
//     });

//     socket.on('pass drawer', () => {
//         const userIds = Object.keys(users);
//         const currentDrawerIndex = userIds.indexOf(drawerSocketId);
//         let nextDrawerIndex = (currentDrawerIndex + 1) % userIds.length;
//         drawerSocketId = userIds[nextDrawerIndex];

//         userIds.forEach((id) => {
//             io.to(id).emit('Drawer', false);
//         });

//         io.to(drawerSocketId).emit('Drawer', true);
//         const newDrawerUsername = users[drawerSocketId];
//         io.emit('chat message', `${newDrawerUsername} is now the drawer`); // Announce the new drawer
//     });

//     socket.on('disconnect', () => {
//         if (drawerSocketId === socket.id) {
//             const remainingUserIds = Object.keys(users).filter(
//                 (id) => id !== socket.id
//             );
//             if (remainingUserIds.length > 0) {
//                 drawerSocketId = remainingUserIds[0];
//                 const newDrawerUsername = users[drawerSocketId];
//                 io.to(drawerSocketId).emit('Drawer', true);
//                 io.emit(
//                     'chat message',
//                     `${newDrawerUsername} is now the drawer`
//                 );
//             } else {
//                 drawerAssigned = false;
//                 drawerSocketId = null;
//             }
//         }

//         delete users[socket.id];
//         io.emit('user list', Object.values(users));
//     });
// });

drawer = () => {
    return true;
};

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
