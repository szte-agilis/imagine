const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const parentDir = path.join(__dirname, '..');
const COMMON_STATIC = path.join(parentDir, '/common');
const FRONTEND_STATIC = path.join(parentDir, '/frontend/build');

app.use(express.static(FRONTEND_STATIC));

app.get('*', (req, res) =>
    res.sendFile(path.join(FRONTEND_STATIC, 'index.html'))
);

app.use(require('body-parser').json());

let _lobbies = {};

function getLobby(lobbyId) {
    console.debug('getLobby', { id: lobbyId });
    if (!_lobbies.hasOwnProperty(lobbyId)) {
        console.error('Lobby not found', { id: lobbyId });
        return null;
    }
    return _lobbies[lobbyId];
}
let correctGuesses = 0;
let intervalId = null;

io.on('connection', (socket) => {
    /**
     *
     * @param {"debug" | "log" | "warn" | "error"} level
     * @param {*} lobby
     * @param  {...any} args
     */
    function logger(level, lobby, ...args) {
        const additionalArgs = [];
        if (lobby) {
            additionalArgs.push(`[lobby#${lobby.id}]`);
            additionalArgs.push(`[user: ${lobby.users[socket.id]}]`);
        } else {
            additionalArgs.push(`[no lobby]`);
        }
        let handler;
        switch (level) {
            case 'debug':
            case 'log':
            case 'warn':
            case 'error':
                handler = console[level];
                break;
            default:
                throw new Error(`Invalid log level: ${level}`);
        }
        handler(`Socket#[${socket.id}]:`, ...additionalArgs, ...args);
    }

    socket.on('join lobby', (lobbyId, username) => {
        if (lobbyId === '0') {
            do {
                lobbyId = Math.floor(
                    100000 + Math.random() * 900000
                ).toString();
            } while (_lobbies.hasOwnProperty(lobbyId));
        }

        socket.join(lobbyId);
        logger('log', null, 'User requested to join lobby:', {
            lobbyId,
            username,
        });

        if (!_lobbies[lobbyId]) {
            _lobbies[lobbyId] = {
                id: lobbyId,
                users: {},
                drawerSocketId: null,
                drawerAssigned: false,
                timer: 10,
                buttonState: 'Click me!',
            };
            logger('log', getLobby(lobbyId), 'New lobby created');
        }

        const lobby = getLobby(lobbyId);

        lobby.users[socket.id] = username;

        if (!lobby.drawerAssigned && username !== 'board') {
            lobby.drawerAssigned = true;
            lobby.drawerSocketId = socket.id;
            io.to(socket.id).emit('Drawer', true);
            io.to(lobbyId).emit(
                'chat message',
                `${username} is now the drawer`
            );
        } else {
            io.to(socket.id).emit('Drawer', false);
        }
        io.to(socket.id).emit('random lobby code', lobbyId);
        io.to(lobbyId).emit('user list', Object.values(lobby.users));
    });

    socket.on('chat message', (lobbyId, msg) => {
        const lobby = getLobby(lobbyId);
        const username = lobby?.users[socket.id] || 'Anonymous';
        if (guess(msg)) {
            io.to(lobbyId).emit('chat message', `${username} kitalalta!`);
            correctGuesses++;
            if (
                correctGuesses ===
                Object.values(lobbies[lobbyId].users).length - 1
            ) {
                clearInterval(intervalId);
                passDrawer(lobbyId);
                correctGuesses = 0;
            }
        } else {
            io.to(lobbyId).emit('chat message', `${username}: ${msg}`);
        }
    });

    socket.on('button clicked', (lobbyId, username) => {
        const lobby = getLobby(lobbyId);
        lobby.buttonState = `${username} clicked the button`;
        io.to(lobbyId).emit('button change', lobby.buttonState);
    });

    socket.on('pass drawer button', (lobbyId) => {
        passDrawer(lobbyId);
    });

    function passDrawer(lobbyId) {
        const lobby = getLobby(lobbyId);
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
        io.to(lobbyId).emit('reset canvas', lobbyId);

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

    socket.on('startGame', (lobbyId) => {
        const lobby = getLobby(lobbyId);
        intervalId = setInterval(() => {
            if (lobby.timer > 0) {
                lobby.timer--;
                console.log(lobby.timer);
                io.to(lobbyId).emit('timer', lobby.timer);
                io.to(lobbyId).emit('solution', 'dummy');
            } else {
                clearInterval(lobby.intervalId);
                lobby.intervalId = null;
                passDrawer(lobbyId);
            }
        }, 1000);
        lobby.timer = 10;
    });

    socket.on('reset canvas', (lobbyId) => {
        //todo: implement (tabla csapat)
    });

    socket.on('window closed', (lobbyId) => {
        socket.disconnect();
        console.log('User left lobby: ', lobbyId);
    });

    socket.on('disconnect', () => {
        const lobbyId = Object.keys(_lobbies).find(
            (id) => _lobbies[id].users[socket.id]
        );
        logger('debug', null, 'User disconnecting', { lobbyId });
        if (!lobbyId) {
            logger('log', null, 'User disconnected without joining a lobby', {
                socketId: socket.id,
            });
            return;
        }

        const lobby = getLobby(lobbyId);
        logger('log', lobby, 'User disconnected from lobby');

        if (!lobby) {
            logger('error', null, 'User connected to non-existent lobby', {
                lobbyId,
            });
            return;
        }
        if (lobby.drawerSocketId === socket.id) {
            passDrawer(lobbyId);
        }

        delete lobby.users[socket.id];
        io.to(lobbyId).emit('user list', Object.values(lobby.users));

        if (Object.keys(lobby.users).length === 0) {
            logger('log', lobby, 'Deleting empty lobby');
            clearInterval(lobby.intervalId);
            delete _lobbies[lobbyId];
        }
    });
});

drawer = () => {
    return true;
};

const PORT = process.env.PORT || 4000;
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
