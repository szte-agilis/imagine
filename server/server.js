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

let lobbies = {};

io.on('connection', (socket) => {
    socket.on('join lobby', (lobbyId, username) => {
        if (lobbyId === '0') {
            do {
                lobbyId = Math.floor(
                    100000 + Math.random() * 900000
                ).toString();
            } while (lobbies.hasOwnProperty(lobbyId));
        }

        socket.join(lobbyId);
        console.log('User joined lobby:', lobbyId);

        if (!lobbies[lobbyId]) {
            lobbies[lobbyId] = {
                users: {},
                drawerSocketId: null,
                drawerAssigned: false,
                buttonState: 'Click me!',
            };
        }

        lobbies[lobbyId].users[socket.id] = username;

        if (!lobbies[lobbyId].drawerAssigned && username !== 'board') {
            lobbies[lobbyId].drawerAssigned = true;
            lobbies[lobbyId].drawerSocketId = socket.id;
            io.to(socket.id).emit('Drawer', true);
            io.to(lobbyId).emit(
                'chat message',
                `${username} is now the drawer`
            );
        } else {
            io.to(socket.id).emit('Drawer', false);
        }
        io.to(socket.id).emit('random lobby code', lobbyId);
        io.to(lobbyId).emit('user list', Object.values(lobbies[lobbyId].users));
    });

    socket.on('chat message', (lobbyId, msg) => {
        const username = lobbies[lobbyId]?.users[socket.id] || 'Anonymous';
        if (guess(msg)) {
            io.to(lobbyId).emit('chat message', `${username} kitalalta!`);
            io.to(lobbyId).emit('reset canvas', lobbyId);
            passDrawer(lobbyId);
        } else {
            io.to(lobbyId).emit('chat message', `${username}: ${msg}`);
        }
    });

    socket.on('button clicked', (lobbyId, username) => {
        lobbies[lobbyId].buttonState = `${username} clicked the button`;
        io.to(lobbyId).emit('button change', lobbies[lobbyId].buttonState);
    });

    socket.on('pass drawer button', (lobbyId) => {
        passDrawer(lobbyId);
    });

    function passDrawer(lobbyId) {
        const lobby = lobbies[lobbyId];
        const userIds = Object.keys(lobby.users);
        const currentDrawerIndex = userIds.indexOf(lobby.drawerSocketId);
        let nextDrawerIndex;

        for (let i = 1; true; i++) {
            nextDrawerIndex =
                userIds[(currentDrawerIndex + i) % userIds.length];
            if (lobby.users[nextDrawerIndex] !== 'board') {
                lobby.drawerSocketId = nextDrawerIndex;
                break;
            }
        }

        userIds.forEach((id) => {
            io.to(id).emit('Drawer', false);
        });

        io.to(lobby.drawerSocketId).emit('Drawer', true);
        const newDrawerUsername = lobby.users[lobby.drawerSocketId];
        io.to(lobbyId).emit(
            'chat message',
            `${newDrawerUsername} is now the drawer`
        );
    }

    socket.on('reset canvas', (lobbyId) => {
        //todo: implement (tabla csapat)
    });

    socket.on('disconnect', () => {
        const lobbyId = Object.keys(lobbies).find(
            (id) => lobbies[id].users[socket.id]
        );
        if (!lobbyId) return;

        const lobby = lobbies[lobbyId];

        if (lobby.drawerSocketId === socket.id) {
            const remainingUserIds = Object.keys(lobby.users).filter(
                (id) => id !== socket.id
            );
            if (remainingUserIds.length > 0) {
                lobby.drawerSocketId = remainingUserIds[0];
                const newDrawerUsername = lobby.users[lobby.drawerSocketId];
                io.to(lobby.drawerSocketId).emit('Drawer', true);
                io.to(lobbyId).emit(
                    'chat message',
                    `${newDrawerUsername} is now the drawer`
                );
            } else {
                lobby.drawerAssigned = false;
                lobby.drawerSocketId = null;
            }
        }

        delete lobby.users[socket.id];
        io.to(lobbyId).emit('user list', Object.values(lobby.users));

        if (Object.keys(lobby.users).length === 0) {
            delete lobbies[lobbyId];
        }
    });
});

drawer = () => {
    return true;
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});

function guess(guess) {
    const solution = 'dummy';
    //ekezetek levetele meg kisbetusites
    guess
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    solution
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    if (guess.toLowerCase() === solution.toLowerCase()) {
        //kitalalta
        return true;
    }

    //levenshtein distance
    if (!guess.length) return solution.length;
    if (!solution.length) return guess.length;
    const arr = [];
    for (let i = 0; i <= solution.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= guess.length; j++) {
            arr[i][j] =
                i === 0
                    ? j
                    : Math.min(
                          arr[i - 1][j] + 1,
                          arr[i][j - 1] + 1,
                          arr[i - 1][j - 1] +
                              (guess[j - 1] === solution[i - 1] ? 0 : 1)
                      );
        }
    }
    const distance = arr[solution.length][guess.length];

    if (solution.length / 3 >= distance) {
        //kozel van a megfejteshez a tipp
        return false;
    }

    return false;
}
