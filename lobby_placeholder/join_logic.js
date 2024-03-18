document
    .getElementById('usernameForm')
    .addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const lobby = document.getElementById('lobby').value;
        let sessionId = sessionStorage.getItem('sessionId');

        if (!sessionId) {
            sessionId = Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }

        const localStorageKey = `username-${sessionId}`;

        localStorage.setItem(localStorageKey, username + '_' + lobby);

        window.location.href = '/gamefield/main_page/index.html';
    });
