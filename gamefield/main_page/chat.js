document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    let local_username, local_lobby;

    let sessionId = sessionStorage.getItem('sessionId');
    const localStorageKey = `username-${sessionId}`;

    const combinedValue = localStorage.getItem(localStorageKey);
    if (combinedValue) {
        const values = combinedValue.split('_');
        local_username = values[0];
        local_lobby = values.length > 1 ? values[1] : null;
        socket.emit('join lobby', local_lobby, local_username);
    } else {
        console.log("No session found or data for this session");
    }

    const drawerIframe = document.getElementById('drawer-iframe');
    const guesserIframe = document.getElementById('guesser-iframe');
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const userListElement = document.getElementById('user-list');
    const passDrawerButton = document.getElementById('passDrawerButton');

    passDrawerButton.addEventListener('click', function() {
        socket.emit( 'pass drawer',local_lobby);
    });


    chatInput.addEventListener('keypress', function(event) {

        if (event.key === 'Enter') {
            event.preventDefault();

            const message = chatInput.value.trim();
            if (message !== '') {

                socket.emit('chat message', local_lobby,message);
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


    socket.on('user list', function(usernames) {
        userListElement.innerHTML = '';
        usernames.forEach((username) => {
            if (username!=="drawerBoard"&&username!=="guesserBoard"){
                const userElement = document.createElement('div');
                userElement.textContent = username;

                if (username === local_username) {
                    userElement.classList.add('current-user');
                }

                userListElement.appendChild(userElement);
            }
        });
    });
});
