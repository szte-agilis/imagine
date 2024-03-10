// Ensure the DOM is fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function() {
    // Establish a connection to the server-side Socket.io instance
    const socket = io();

    // Grab references to DOM elements
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const userCount = document.getElementById('user-count');

    // Listen for the 'Enter' keypress to send a chat message
    chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action to avoid form submission
            const message = chatInput.value.trim(); // Trim whitespace from the message
            if (message !== '') {
                socket.emit('chat message', message); // Emit the message to the server
                chatInput.value = ''; // Clear the input field after sending
            }
        }
    });

    // Listen for incoming chat messages to display them
    socket.on('chat message', function(message) {
        const messageElement = document.createElement('div'); // Create a new div for the message
        messageElement.textContent = message; // Set the message text
        chatWindow.appendChild(messageElement); // Append the message to the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message
    });

    // Update the displayed user count as it changes
    socket.on('user count', function(count) {
        userCount.textContent = 'Connected Users: ' + count;
    });
});
