import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Drawerfield from '../drawerfield/Drawerfield';

function GameField() {
    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(sessionStorage.getItem('username'));
    const [localLobby, setLocalLobby] = useState(sessionStorage.getItem('lobby'));
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [showDrawerPass, setShowDrawerPass] = useState(false);
    const [canDraw, setCanDraw] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const chatWindow = document.getElementById('chat-window');

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit('join lobby', localLobby, localUsername);

            socket.on('random lobby code', (randomLobby) => {
                setLocalLobby(randomLobby);
                sessionStorage.setItem('lobby', randomLobby);
            });

            socket.on('chat message', (message) => {
                const messageElement = document.createElement('div');
                messageElement.textContent = message;
                chatWindow.appendChild(messageElement);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            });

            socket.on('Drawer', (canDraw) => {
                setCanChat(!canDraw);
                setCanDraw(canDraw);
                setShowDrawerPass(canDraw);
            });

            socket.on('user list', (usernames) => {
                setUsers(usernames.filter(username => username !== 'board'));
            });

            return () => {
                socket.off('random lobby code');
                socket.off('chat message');
                socket.off('Drawer');
                socket.off('user list');
            };
        }
    }, [socket, localLobby, localUsername]);

    const handlePassDrawer = () => {
        if (socket) {
            socket.emit('pass drawer', localLobby);
            socket.emit('reset canvas', localLobby);
        }
    };

    const handleChatInputKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const message = event.target.value.trim();
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
                    {canDraw && <button
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
