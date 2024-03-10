document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const userCount = document.getElementById('user-count');

    chatInput.addEventListener('keypress', function(event) {
        console.log(event.key)
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

    socket.on('user count', function(count) {
        userCount.textContent = 'Connected Users: ' + count;
    });
});
