const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');

const server = http.createServer((req, res) => {
    fs.readFile('index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});

const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (message) => {
        console.log('Received message:', message);
        io.emit('chat message', message);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
