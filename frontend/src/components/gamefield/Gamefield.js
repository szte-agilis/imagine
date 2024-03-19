import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function GameField() {
    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(null);
    const [localLobby, setLocalLobby] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [chatInput, setChatInput] = useState("");

    useEffect(() => {
        const newSocket = io(); // Initialize Socket.IO connection
        setSocket(newSocket);

        const storedSessionId = sessionStorage.getItem('sessionId');
        setSessionId(storedSessionId);

        // Clean up on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            const combinedValue = localStorage.getItem(sessionId);
            if (combinedValue) {
                const values = combinedValue.split('_');
                setLocalUsername(values[0]);
                setLocalLobby(values.length > 1 ? values[1] : null);
                socket.emit('join lobby', localLobby, localUsername);
            } else {
                console.log('No session found or data for this session');
            }

            socket.on('random lobby code', (randomLobby) => {
                console.log('random lobby code', randomLobby);
                setLocalLobby(randomLobby);
                localStorage.setItem(
                    sessionId,
                    localUsername + '_' + randomLobby
                );
                //lobbyID.textContent = 'Lobby kód: ' + randomLobby;
            });

            // socket.on('chat message', (message) => {
            //     const messageElement = document.createElement('div');
            //     messageElement.textContent = message;
            //     chatWindow.appendChild(messageElement);
            //     chatWindow.scrollTop = chatWindow.scrollHeight;
            // });

            // socket.on('Drawer', (canDraw) => {
            //     if (canDraw) {
            //         chatInput.style.display = 'none';
            //         guesserIframe.style.display = 'none';
            //         drawerIframe.style.display = '';
            //         passDrawerButton.style.display = '';
            //     } else {
            //         chatInput.style.display = '';
            //         guesserIframe.style.display = '';
            //         drawerIframe.style.display = 'none';
            //         passDrawerButton.style.display = 'none';
            //     }
            // });

            // socket.on('user list', (usernames) => {
            //     userListElement.innerHTML = '';
            //     usernames.forEach((username) => {
            //         if (username !== 'board') {
            //             const userElement = document.createElement('div');
            //             userElement.textContent = username;

            //             if (username === localUsername) {
            //                 userElement.classList.add('current-user');
            //             }

            //             userListElement.appendChild(userElement);
            //         }
            //     });
            // });
        }
    }, [socket, sessionId, localUsername, localLobby, chatInput.style]);

    const handlePassDrawer = () => {
        if (socket) {
            socket.emit('pass drawer', localLobby);
            socket.emit('reset canvas', localLobby);
        }
    };

    const handleChatInputKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const message = event.value.trim();
            if (message !== '') {
                socket.emit('chat message', localLobby, message);
                setChatInput('');
            }
        }
    };

    return (
        <div>
            <div id="container">
                <iframe
                    id="drawer-iframe"
                    src="/playingCards/drawerBoard.html"
                    style={{ display: 'none' }}
                ></iframe>
                <iframe
                    id="guesser-iframe"
                    src="/playingCards/guesserBoard.html"
                ></iframe>
                <div id="chat-container">
                    <div id="chat-window"></div>
                    <label htmlFor="chat-input"></label>
                    <input
                        id="chat-input"
                        type="text"
                        value={chatInput}
                        placeholder="Type a message and press Enter"
                        onKeyPress={handleChatInputKeyPress}
                    />
                    <button
                        id="passDrawerButton"
                        style={{ display: 'none' }}
                        onClick={handlePassDrawer}
                    >
                        Pass Drawer Role
                    </button>
                </div>
            </div>
            <div id="user-list" style={{ marginTop: '20px' }}></div>
            <div id="lobby-id" style={{ marginTop: '20px' }}></div>
        </div>
    );
}

export default GameField;
