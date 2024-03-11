document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username'); // Retrieve the username
    const socket = io();

    socket.emit('new user', username);

    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const userListElement = document.getElementById('user-list');

    chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const message = chatInput.value.trim();
            if (message !== '') {
                socket.emit('chat message', message);
                chatInput.value = '';
            }
        }
    });

    socket.on('chat message', function(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });

    socket.on('user list', function(usernames) {
        userListElement.innerHTML = '';
        usernames.forEach((username) => {
            const userElement = document.createElement('div');
            userElement.textContent = username;
            userListElement.appendChild(userElement);
        });
    });
});
