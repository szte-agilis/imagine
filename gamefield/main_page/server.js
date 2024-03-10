const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Determine the file path based on the incoming request URL
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
    };

    // Default to octet stream if the file type is not found
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read and serve the requested file
    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code === 'ENOENT') {
                // Serve index.html if the requested file is not found
                fs.readFile(path.join(__dirname, 'index.html'), function(error, content) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Handle server errors
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            }
        } else {
            // Serve the file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const io = socketIo(server); // Initialize socket.io
let userCount = 0; // Track connected users

io.on('connection', (socket) => {
    userCount++;
    // Broadcast the updated user count
    io.emit('user count', userCount);

    // Handle chat message events
    socket.on('chat message', (message) => {
        io.emit('chat message', message);
    });

    // Broadcast the button change event
    socket.on('button clicked', () => {
        const newText = "Clicked!";
        io.emit('button change', newText);
    });

    // Update the user count when a user disconnects
    socket.on('disconnect', () => {
        userCount--;
        io.emit('user count', userCount);
    });
});

const PORT = process.env.PORT || 3000;
// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
