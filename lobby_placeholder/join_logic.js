// Add an event listener to the form with the id 'usernameForm' for the 'submit' event
document
    .getElementById('usernameForm')
    .addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission behavior

        // Get the value entered in the input field with the id 'username'
        const username = document.getElementById('username').value;

        // Store the username in the local storage
        localStorage.setItem('username', username);

        // Redirect the user to '/gamefield/main_page/index.html'
        window.location.href = '/gamefield/main_page/index.html';
    });
