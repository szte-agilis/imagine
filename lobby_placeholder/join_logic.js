// Add an event listener to the form with the id 'usernameForm' for the 'submit' event
document
    .getElementById('usernameForm')
    .addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        let sessionId = sessionStorage.getItem('sessionId');

        if (!sessionId) {
            sessionId = Math.random().toString(36).substr(2, 9); // Generate a random session ID
            sessionStorage.setItem('sessionId', sessionId);
        }

        const localStorageKey = `username-${sessionId}`;

        localStorage.setItem(localStorageKey, username);

        window.location.href = '/gamefield/main_page/index.html';
    });
