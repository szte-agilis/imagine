import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import Board from '../drawerfield/Board';

function GameField() {
    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(sessionStorage.getItem('username'));
    const [localLobby, setLocalLobby] = useState(sessionStorage.getItem('lobby'));
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [canDraw, setCanDraw] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const [localTimer, setlocalTimer] = useState(15);
    const chatWindow = document.getElementById('chat-window');
    
    const [solution, setSolution] = useState("");
    const [myPoints, setMyPoints] = useState(0);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);
        newSocket.emit('join lobby', localLobby, localUsername);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket) {

            socket.on('chat message', (message) => {
                const messageElement = document.createElement('div');
                messageElement.textContent = message;
                chatWindow.appendChild(messageElement);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            });

            socket.on('Drawer', (canDraw) => {
                setCanChat(!canDraw);
                setCanDraw(canDraw);
            });

            socket.on('points-for-guesser', (pointsObject) => {
                if(pointsObject.username === localUsername){
                    setMyPoints(prevMyPoints => prevMyPoints + pointsObject.points)
                }
            });

            socket.on('points-for-drawer', (points) => {
                setMyPoints(prevMyPoints => prevMyPoints + points)
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

            socket.on('clearChat',()=>{
                chatWindow.innerHTML = "";
            })

            socket.on('solution', (solutionFromSocket) => {
                setSolution(solutionFromSocket);
            });
            const handleBeforeUnload = (event) => {
                event.preventDefault();
                if (socket) {
                    socket.emit('window closed', localLobby, localUsername);
                }
                event.returnValue = '';
            };

            window.addEventListener('beforeunload', handleBeforeUnload);

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

    const clearChat = () =>{
        if(socket) {
            socket.emit("clearChat", localLobby);
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

    return (
        <div>
            <div id="container">
                <Board canDraw={canDraw} />
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
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            padding: '5px',
                            marginTop: '10px',
                            width: '100%',
                        }}
                    />}
                    {canDraw && <button
                        id="passDrawerButton"
                        onClick={handlePassDrawer}
                        style={{ border: '1px solid white', padding: '5px', borderRadius: '5px', backgroundColor: 'transparent', color: 'white', cursor: 'pointer' }}
                    >Pass Drawer Role
                    </button>}
                    {canDraw && <button
                        id="StartGameButton"
                        onClick={()=>{startGameTimer()
                        clearChat()}}
                        style={{ border: '1px solid white', padding: '5px', borderRadius: '5px', backgroundColor: 'transparent', color: 'white', cursor: 'pointer', marginTop: '10px' }}
                    >Start Game
                    </button>}
                </div>
            </div>
            <div id="user-list" style={{ marginTop: '20px' }}>
                {users.map((user, index) => (
                    <div key={index}>{user}</div>
                ))}
            </div>
            <div id="lobby-id" style={{ marginTop: '20px' }}>Lobby kód: {localLobby}</div>
            <div id="timer-text" style={{ marginTop: '20px' }}>Timer: {localTimer}</div>
            {canDraw && <div id="solution" style={{ marginTop: '20px' }}>Megfejtés: {solution}</div>}
            <div id="timer-text" style={{ marginTop: '20px' }}>Pontjaim: {myPoints}</div>
        </div>
    );
}

export default GameField;