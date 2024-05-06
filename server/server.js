const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const fs = require('fs');

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

let _lobbies = {};

function getLobby(lobbyId) {
    console.debug('getLobby', { id: lobbyId });
    if (!_lobbies.hasOwnProperty(lobbyId)) {
        console.error('Lobby not found', { id: lobbyId });
        return null;
    }
    return _lobbies[lobbyId];
}

function lobbiesStats() {
    return Object.entries(_lobbies).map(([id, lobby]) => ({
        id: lobby.id,
        name: lobby.name,
        users: Object.values(lobby.users).length,
        gameStarted: lobby.gameStarted,
    }));
}

function checkUsername(name) {
    for (const l of Object.keys(_lobbies)) {
        for (const n of Object.values(_lobbies[l]['users'])) {
            if (n === name) {
                return true;
            }
        }
    }
    return false;
}

//let correctGuesses = 0;
const solutions = JSON.parse(
    fs.readFileSync(COMMON_STATIC + '/solutions.json', 'utf-8')
);

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

    socket.on('create lobby', (lobbyId, username) => {
        if (lobbyId === '0') {
            do {
                lobbyId = Math.floor(
                    100000 + Math.random() * 900000
                ).toString();
            } while (_lobbies.hasOwnProperty(lobbyId));
        }
        let pointMap = new Map();
        if (!_lobbies[lobbyId]) {
            _lobbies[lobbyId] = {
                id: lobbyId,
                name: '',
                users: {},
                drawerSocketId: null,
                drawerAssigned: false,
                timer: 150,
                buttonState: 'Click me!',
                solution: 'biztosnemtalaljakisenki',
                correctGuesses: 0,
                currentRound: 1,
                pointMap: pointMap,
                gameStarted: false,
                counter: 0,
                intervalId: null,
            };
            logger('log', getLobby(lobbyId), 'New lobby created');
        } else {
            if (Object.values(_lobbies[lobbyId].users).includes(username)) {
                const socketId = Object.keys(_lobbies[lobbyId].users).find(
                    (key) => _lobbies[lobbyId].users[key] === username
                );
                delete _lobbies[lobbyId].users[socketId];
            }
        }

        socket.join(lobbyId);
        console.log(`User ${username} joined lobby: ${lobbyId}`);

        const lobby = getLobby(lobbyId);

        lobby.users[socket.id] = username;

        lobby.pointMap.set(username, 0);

        io.to(lobbyId).emit('user list', Object.values(lobby.users));

        io.emit('list-lobbies', lobbiesStats());
    });

    socket.on('join lobby', (lobbyId, username) => {
        if (!_lobbies[lobbyId]) {
            socket.emit('lobby not exists', 'Lobby does not exist');
            return;
        }

        socket.join(lobbyId);

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

        if (socket.id === lobby.drawerSocketId) {
            // Send the random solutions to the drawer
            const randomSolutions = getRandomSolutions();
            io.to(socket.id).emit('choose solution', randomSolutions);
        }

        io.to(lobbyId).emit('user list', Object.values(lobby.users));
        io.emit('list-lobbies', lobbiesStats());
    });

    socket.on('start game clicked', (lobbyId) => {
        const lobby = getLobby(lobbyId);
        lobby.users = {};
        lobby.gameStarted = true;
        io.emit('list-lobbies', lobbiesStats());
        io.to(lobbyId).emit('redirect', '/gamefield');
    });

    socket.on('init-points', (lobbyId) => {
        const lobby = getLobby(lobbyId);
        if (lobby) {
            io.to(lobbyId).emit(
                'points',
                Array.from(getLobby(lobbyId).pointMap.entries())
            );
        }
    });

    socket.on('chat message', (lobbyId, msg) => {
        const lobby = getLobby(lobbyId);
        const username = lobby?.users[socket.id] || 'Anonymous';
        if (guess(msg, lobby.solution)) {
            io.to(lobbyId).emit('chat message', {
                message: `${username} kitalalta!`,
                guessedCorrectly: true,
                username: username,
            });
            if (lobby.correctGuesses == 0) {
                lobby.pointMap.set(
                    username,
                    lobby.pointMap.get(username) + 1000 + lobby.timer * 5
                );
                io.to(lobbyId).emit(
                    'points',
                    Array.from(lobby.pointMap.entries())
                );
            } else {
                lobby.pointMap.set(
                    username,
                    lobby.pointMap.get(username) +
                        1000 -
                        lobby.correctGuesses * 50 +
                        lobby.timer * 5
                );
                io.to(lobbyId).emit(
                    'points',
                    Array.from(lobby.pointMap.entries())
                );
            }
            lobby.correctGuesses++;
            if (
                lobby.correctGuesses ===
                Object.values(_lobbies[lobbyId].users).length - 1
            ) {
                clearInterval(lobby.intervalId);
                lobby.pointMap.set(
                    lobby.users[lobby.drawerSocketId],
                    lobby.pointMap.get(lobby.users[lobby.drawerSocketId]) + 1000 //mindenki kitalalta -> drawer 1000 pontot kap
                );
                io.to(lobby.drawerSocketId).emit(
                    'points',
                    Array.from(lobby.pointMap.entries())
                );
                console.log('drawer awarded(everyone got it): ' + 1000);
                passDrawer(lobbyId);
                lobby.correctGuesses = 0;
            }
        } else {
            io.to(lobbyId).emit('chat message', {
                message: `${username}: ${msg}`,
                guessedCorrectly: false,
                username: username,
            });
        }
    });

    socket.on('check username', (name) => {
        io.to(socket.id).emit('username taken', checkUsername(name));
    });

    socket.on('list-lobbies', () => {
        socket.emit('list-lobbies', lobbiesStats());
    });

    socket.on('lobby data changed', (lobbyId, lobbyData) => {
        const lobby = getLobby(lobbyId);
        lobby.name = lobbyData.name;
        lobby.id = lobbyData.lobbyId;
        socket.to(lobbyId).emit('change lobby data', lobbyData);
        io.emit('list-lobbies', lobbiesStats());
    });

    socket.on('button clicked', (lobbyId, username) => {
        const lobby = getLobby(lobbyId);
        lobby.buttonState = `${username} clicked the button`;
        io.to(lobbyId).emit('button change', lobby.buttonState);
    });

    socket.on('pass drawer button', (lobbyId) => {
        const lobby = getLobby(lobbyId);

        lobby.timer = 0;
    });

    socket.on('get solutions', () => {
        const randomSolutions = getRandomSolutions();
        io.to(socket.id).emit('choose solution', randomSolutions);
    });

    socket.on('pick solution', ({ lobbyId, pickedSolution }) => {
        io.to(socket.id).emit('startGame', { lobbyId, pickedSolution });
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

        lobby.counter += 1;
        console.log('counter' + lobby.counter);
        console.log('userids' + userIds.length);
        if (lobby.counter == userIds.length) {
            io.to(lobbyId).emit('new round', lobby.currentRound + 1);
            lobby.currentRound++;
            lobby.counter = 0;
        }

        userIds.forEach((id) => {
            io.to(id).emit('Drawer', false);
        });

        io.to(lobby.drawerSocketId).emit('Drawer', true);
        const randomSolutions = getRandomSolutions();
        io.to(lobby.drawerSocketId).emit('choose solution', randomSolutions);
        const newDrawerUsername = lobby.users[lobby.drawerSocketId];
        io.to(lobbyId).emit(
            'chat message',
            `${newDrawerUsername} is now the drawer`
        );
        io.to(lobby.drawerSocketId).emit(
            'points',
            Array.from(lobby.pointMap.entries())
        );
    }

    socket.on('startGame', ({ lobbyId, pickedSolution }) => {
        const lobby = getLobby(lobbyId);

        io.to(lobbyId).emit('board-reset', 0);

        io.to(lobby.drawerSocketId).emit(
            'points',
            Array.from(lobby.pointMap.entries())
        );

        lobby.intervalId = setInterval(() => {
            if (lobby.timer > 0) {
                lobby.timer--;
                console.log(lobby.timer);
                io.to(lobbyId).emit('timer', lobby.timer);
                io.to(lobbyId).emit('solution', pickedSolution);
                lobby.solution = pickedSolution;
            } else {
                const numberOfPlayers = Object.keys(lobby.users).length;
                if (
                    lobby.correctGuesses >
                    numberOfPlayers - 1 - lobby.correctGuesses
                ) {
                    lobby.pointMap.set(
                        lobby.users[lobby.drawerSocketId],
                        lobby.pointMap.get(lobby.users[lobby.drawerSocketId]) +
                            750
                    );
                    io.to(lobby.drawerSocketId).emit(
                        'points',
                        Array.from(lobby.pointMap.entries())
                    );
                    console.log('drawer awarded(more correct): ' + 750);
                } else if (
                    lobby.correctGuesses <
                    numberOfPlayers - 1 - lobby.correctGuesses
                ) {
                    lobby.pointMap.set(
                        lobby.users[lobby.drawerSocketId],
                        lobby.pointMap.get(lobby.users[lobby.drawerSocketId]) +
                            250
                    );
                    io.to(lobby.drawerSocketId).emit(
                        'points',
                        Array.from(lobby.pointMap.entries())
                    );
                    console.log(
                        'drawer awarded(less correct): ' + 250 //kevesebb a jó tipp -> 250 pont
                    );
                } else if (
                    lobby.correctGuesses ==
                    numberOfPlayers - 1 - lobby.correctGuesses
                ) {
                    lobby.pointMap.set(
                        lobby.users[lobby.drawerSocketId],
                        lobby.pointMap.get(lobby.users[lobby.drawerSocketId]) +
                            500
                    );
                    io.to(lobby.drawerSocketId).emit(
                        'points',
                        Array.from(lobby.pointMap.entries())
                    );
                    console.log(
                        'drawer awarded(equal): ' + 500 // Egyenlő rossz tipp mint jó -> 500 pont
                    );
                }
                clearInterval(lobby.intervalId);
                lobby.intervalId = null;
                passDrawer(lobbyId);
            }
        }, 1000);
        lobby.timer = 150;
    });

    socket.on('clearChat', (lobbyId) => {
        io.to(lobbyId).emit('clearChat');
    });

    socket.on('window closed', (lobbyId, username) => {
        socket.disconnect();
        console.log(`User ${username} left lobby: ${lobbyId}`);
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
            lobby.timer = 0;
            io.to(lobbyId).emit('timer', lobby.timer);
        }
        io.to(lobbyId).emit(
            'chat message',
            `${lobby.users[socket.id]} left the game.`
        );
        if (lobby.drawerSocketId === socket.id) {
            passDrawer(lobbyId);
        }
        lobby.pointMap.delete(lobby.users[socket.id]);
        delete lobby.users[socket.id];
        io.to(lobbyId).emit('user list', Object.values(lobby.users));
        io.to(lobbyId).emit('points', Array.from(lobby.pointMap.entries()));

        if (Object.keys(lobby.users).length === 0) {
            logger('log', lobby, 'Deleting empty lobby');
            clearInterval(lobby.intervalId);
            delete _lobbies[lobbyId];
        }
        io.emit('list-lobbies', lobbiesStats());
    });

    socket.on('board-add', (lobbyId, message) => {
        io.to(lobbyId).emit('board-add', message);
    });

    socket.on('board-remove', (lobbyId, message) => {
        io.to(lobbyId).emit('board-remove', message);
    });

    socket.on('board-rotate', (lobbyId, message) => {
        io.to(lobbyId).emit('board-rotate', message);
    });

    socket.on('board-scale', (lobbyId, message) => {
        io.to(lobbyId).emit('board-scale', message);
    });

    socket.on('board-move', (lobbyId, message) => {
        io.to(lobbyId).emit('board-move', message);
    });
});

drawer = () => {
    return true;
};

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});

function getRandomSolutions() {
    const randomIndices = [];
    while (randomIndices.length < 3) {
        const randomIndex = Math.floor(Math.random() * solutions.length);
        if (!randomIndices.includes(randomIndex)) {
            randomIndices.push(randomIndex);
        }
    }
    return randomIndices.map((index) => solutions[index]);
}

function guess(guess, solution) {
    //const solution = 'dummy';
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
