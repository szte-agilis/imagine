// This event listener waits for the DOM content to be fully loaded before executing the provided function
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the username from local storage
    const username = localStorage.getItem('username');
    // Initialize a WebSocket connection
    const socket = io();

    // Emit a 'new user' event to the server with the retrieved username
    socket.emit('new user', username);

    // Get references to the chat input, chat window, and user list elements
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const userListElement = document.getElementById('user-list');

    // Event listener for keypress events on the chat input
    chatInput.addEventListener('keypress', function(event) {
        // Check if the pressed key is Enter
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default behavior of Enter key (e.g., submitting a form)
            // Trim whitespace from the message and check if it's not empty
            const message = chatInput.value.trim();
            if (message !== '') {
                // Emit a 'chat message' event to the server with the message content
                socket.emit('chat message', message);
                chatInput.value = ''; // Clear the chat input after sending the message
            }
        }
    });

    // Event listener for receiving 'chat message' events from the server
    socket.on('chat message', function(message) {
        // Create a new div element to display the received message
        const messageElement = document.createElement('div');
        messageElement.textContent = message; // Set the text content of the message element
        chatWindow.appendChild(messageElement); // Append the message element to the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the bottom of the chat window
    });

    // Event listener for receiving 'user list' events from the server
    socket.on('user list', function(usernames) {
        userListElement.innerHTML = ''; // Clear the user list element
        // Iterate over the array of usernames received from the server
        usernames.forEach((username) => {
            // Create a new div element for each username and append it to the user list
            const userElement = document.createElement('div');
            userElement.textContent = username; // Set the text content of the user element
            userListElement.appendChild(userElement); // Append the user element to the user list
        });
    });
});
