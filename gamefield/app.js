const http = require('http');

const server = http.createServer((req, res) => {
    // Set the response header to indicate HTML content
    res.writeHead(200, { 'Content-Type': 'text/html' });
    // HTML content with an iframe and a text input field
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Page with Iframe and Input</title>
        </head>
        <body>
            <iframe src="https://example.com" width="600" height="400"></iframe>
            <br>
            <input type="text" placeholder="Enter some text">
        </body>
        </html>
    `;
    res.end(htmlContent);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
