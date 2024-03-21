import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Drawerfield from '../drawerfield/Drawerfield';

function GameField() {
    const [socket, setSocket] = useState(io());
    const [localUsername, setLocalUsername] = useState(sessionStorage.getItem('username'));
    const [localLobby, setLocalLobby] = useState(sessionStorage.getItem('lobby'));
    const [sessionId, setSessionId] = useState(null);
    const [chatInput, setChatInput] = useState("");
    const [users, setUsers] = useState([]);
    const [lobbyID, setLobbyID] = useState(0);
    const [showDraverPass, setShowDrawerPass] = useState(false);
    const [canDraw, setCanDraw] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const chatWindow = document.getElementById('chat-window');



    useEffect(() => {
        if (socket) {
            //setLocalLobby(sessionStorage.getItem('lobby'))
            //setLocalUsername(sessionStorage.getItem('username'))
            console.log('localLobby', localLobby);
            console.log('localUsername', localUsername);

            socket.emit('join lobby', localLobby, localUsername);
            console.log('emmited');


            socket.on('random lobby code', (randomLobby) => {
                console.log('random lobby code', randomLobby);
                setLocalLobby(randomLobby);
                sessionStorage.setItem('lobby', randomLobby);
                //setLobbyID(randomLobby);
            });

            socket.on('chat message', (message) => {
                const messageElement = document.createElement('div');
                messageElement.textContent = message;
                chatWindow.appendChild(messageElement);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            });

            socket.on('Drawer', (canDraw) => {
                if (canDraw) {
                    setCanChat(false);
                    setCanDraw(true);
                    setShowDrawerPass(true);
                } else {
                    setCanChat(true);
                    setCanDraw(false);
                    setShowDrawerPass(false);
                }
            });

            socket.on('user list', (usernames) => {
                usernames.forEach((username) => {
                    if (username !== 'board') {
                        const userElement = document.createElement('div');
                        userElement.textContent = username;

                        if (username === localUsername) {
                            userElement.classList.add('current-user');
                        }

                        setUsers(users + userElement);
                    }
                });
            });
        }
    }, [socket, sessionId, localUsername, localLobby, chatWindow,users]);

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
                <Drawerfield />
                <div id="chat-container">
                    <div id="chat-window"></div>
                    <label htmlFor="chat-input"></label>
                    {canChat && <input
                        id="chat-input"
                        type="text"
                        value={chatInput}
                        placeholder="Type a message and press Enter"
                        onKeyPress={handleChatInputKeyPress}
                        onChange={(event) => setChatInput(event.target.value)}
                    />}
                    {showDraverPass && <button
                        id="passDrawerButton"
                        onClick={handlePassDrawer}
                    >Pass Drawer Role
                    </button>}
                </div>
            </div>
            <div id="user-list" style={{ marginTop: '20px' }}>{users}</div>
            <div id="lobby-id" style={{ marginTop: '20px' }}>Lobby kód: {localLobby}</div>
        </div>
    );
}

export default GameField;
