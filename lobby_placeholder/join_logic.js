// Add an event listener to the form with the id 'usernameForm' for the 'submit' event
document
    .getElementById('usernameForm')
    .addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const lobbyId = document.getElementById('lobby-id').value;
        let sessionId = sessionStorage.getItem('sessionId');

        if (!sessionId) {
            sessionId = Math.random().toString(36).substr(2, 9); // Generate a random session ID
            sessionStorage.setItem('sessionId', sessionId);
        }

        localStorage.setItem(`username-${sessionId}`, username);
        localStorage.setItem(`lobbyid-${sessionId}`, lobbyId);

        window.location.href = '/gamefield/main_page/index.html';
    });
