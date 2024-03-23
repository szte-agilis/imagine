import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Board from '../drawerfield/Board';

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
    const [localTimer, setlocalTimer] = useState(10);
    const chatWindow = document.getElementById('chat-window');
    const [solution, setSolution] = useState("");


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
                setUsers(usernames);
                //setUsers(usernames.filter(username => username !== 'board'));
            });

            socket.on('timer', (time) => {
                setlocalTimer(time);
                if (time === 0) {
                    setlocalTimer(10);
                }
            });

            socket.on('solution', (solutionFromSocket) => {
                setSolution(solutionFromSocket);
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
            socket.emit('pass drawer button', localLobby);
            socket.emit('reset canvas', localLobby);
            setSolution("");
        }
    };

    const startGameTimer = () => {
        if (socket) {
            socket.emit('startGame', localLobby);
        }
    }

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

    window.addEventListener("beforeunload", function() {  
        socket.emit('window closed', localLobby);
    });

    return (
        <div>
            <div id="container">
                <Board />
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
                    {canDraw && <button
                        id="StartGameButton"
                        onClick={startGameTimer}
                    >Start Game
                    </button>}
                </div>
            </div>
            <div id="user-list" style={{ marginTop: '20px' }}>{users}</div>
            <div id="lobby-id" style={{ marginTop: '20px' }}>Lobby kód: {localLobby}</div>
            <div id="timer-text" style={{ marginTop: '20px' }}>Timer: {localTimer}</div>
            {canDraw && <div id="solution" style={{ marginTop: '20px' }}>Megfejtés: {solution}</div>}
        </div>
    );
}

export default GameField;
