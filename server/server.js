const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');

const parentDir = path.join(__dirname, '..')+'/';

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? parentDir+'/lobby_placeholder/join.html' : parentDir+req.url;
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code === 'ENOENT') {
                fs.readFile(path.join(parentDir, '404/error.html'), function(error, content) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const io = socketIo(server);
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

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
