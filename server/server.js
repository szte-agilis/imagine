// Import required modules
const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');

// Define the parent directory path
const parentDir = path.join(__dirname, '..') + '/';

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Determine the file path based on the request URL
    let filePath = req.url === '/' ? parentDir + '/lobby_placeholder/join.html' : parentDir + req.url;
    // Determine the file extension and corresponding MIME type
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read the file from the file system
    fs.readFile(filePath, function(error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                // If the file is not found, serve a 404 error page
                fs.readFile(path.join(parentDir, '404/error.html'), function(error, content) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // If there's a server error, return a 500 status code
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            // Serve the file with appropriate content type
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Initialize Socket.IO with the HTTP server
const io = socketIo(server);

// Object to store connected users
let users = {};

// Handle socket connections
io.on('connection', (socket) => {
    // Handle 'new user' event
    socket.on('new user', (username) => {
        users[socket.id] = username; // Store the username associated with the socket id
        io.emit('user list', Object.values(users)); // Emit 'user list' event with updated user list
    });

    // Handle 'chat message' event
    socket.on('chat message', (msg) => {
        const username = users[socket.id] || 'Anonymous'; // Get the username associated with the socket id
        io.emit('chat message', `${username}: ${msg}`); // Emit 'chat message' event with the username and message
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        delete users[socket.id]; // Remove the user from the users object upon disconnection
        io.emit('user list', Object.values(users)); // Emit 'user list' event with updated user list
    });
});

// Set the port for the server to listen on
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
