// This event listener waits for the DOM content to be fully loaded before executing the provided function
document.addEventListener('DOMContentLoaded', function() {
    const socket = io();


    let sessionId = sessionStorage.getItem('sessionId');

    if (!sessionId) {
        sessionId = Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
    }

    const localStorageKey = `username-${sessionId}`;
    const username = localStorage.getItem(localStorageKey);

    if (username) {
        socket.emit('new user', username);
    } else {
        console.error('Username is not set in localStorage.');
    }

    // Get references to the chat input, chat window, and user list elements
    const drawerIframe = document.getElementById('drawer-iframe');
    const guesserIframe = document.getElementById('guesser-iframe');
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const userListElement = document.getElementById('user-list');
    const passDrawerButton = document.getElementById('passDrawerButton');

    passDrawerButton.addEventListener('click', function() {
        socket.emit('pass drawer');
    });

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

    socket.on('Drawer', function(canDraw) {
        if (canDraw) {
            chatInput.style.display = 'none';
            guesserIframe.style.display = 'none';
            drawerIframe.style.display = '';
            passDrawerButton.style.display = '';
        } else {
            chatInput.style.display = '';
            guesserIframe.style.display = '';
            drawerIframe.style.display = 'none';
            passDrawerButton.style.display = 'none';
        }
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
