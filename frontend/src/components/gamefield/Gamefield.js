import React, { useState, useEffect } from 'react';
import {io} from 'socket.io-client';
import Board from '../drawerfield/Board';

function GameField() {
    const rounds = 3;
    //const lobbyData = JSON.parse(sessionStorage.getItem("lobbyData"));

    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(sessionStorage.getItem('username'));
    const [localLobby, setLocalLobby] = useState(sessionStorage.getItem('lobby'));
    const [chatInput, setChatInput] = useState("");
    const [currentRound, setCurrentRound] = useState(1);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [canDraw, setCanDraw] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const [localTimer, setlocalTimer] = useState(15);
    const chatWindow = document.getElementById('chat-window');
    const [isGameEnded, setIsGameEnded] = useState(false);
    
    const [solution, setSolution] = useState("");
    const [randomSolutions, setRandomSolutions] = useState([]);
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
                if(chatWindow !== null){
                    chatWindow.appendChild(messageElement);
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }  
            });

            socket.on('Drawer', (canDraw) => {
                setCanChat(!canDraw);
                setCanDraw(canDraw);
            });

            socket.on('new round', (currentRound) => {
                setCurrentRound(currentRound);
                if(rounds+1 === currentRound){
                    setIsGameEnded(true)
                }
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

            socket.on('choose solution', (randomSolutions) => {
                setRandomSolutions(randomSolutions);
            });

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


    const startGameTimer = (pickedSolution) => {
        if (socket && localLobby) {
            socket.emit('startGame', {lobbyId: localLobby, pickedSolution: pickedSolution});
            //socket.emit('startGame', localLobby);
            setRandomSolutions([]);
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
        {isGameEnded ? (<div>
            <h2>Game Ended</h2>
            <p>Game has ended, you can leave the lobby now</p>
            <a href='http://localhost:3001'>Főoldal</a>
        </div>):(<div>
            <div id="container">
                <Board canDraw={canDraw} localLobby={localLobby} socket={socket}/>
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
                    {/* {canDraw && <button
                        id="StartGameButton"
                        onClick={()=>{startGameTimer()
                        clearChat()}}
                        style={{ border: '1px solid white', padding: '5px', borderRadius: '5px', backgroundColor: 'transparent', color: 'white', cursor: 'pointer', marginTop: '10px' }}
                    >Start Game
                    </button>}*/}
                </div>
                <br />
                {canDraw && randomSolutions.length > 0 && (
                <div>
                    <h2>Choose a solution:</h2>
                        {randomSolutions.map((solution, index) => (
                                <button id={index.toString()}
                                        key={index}
                                        onClick={() => {startGameTimer(solution); clearChat();}}
                                        style={{ border: '1px solid white', padding: '5px', borderRadius: '5px', backgroundColor: 'transparent', color: 'white', cursor: 'pointer' }}>
                                    {solution}
                                </button>
                        ))}
                </div>
                )}
                <br />
            </div>
            <div id="user-list" style={{ marginTop: '20px' }}>
                {users.map((user, index) => (
                    <div key={index}>{user}</div>
                ))}
            </div>
            <div id="lobby-id" style={{ marginTop: '20px' }}>Lobby kód: {localLobby}</div>
            <div id="timer-text" style={{ marginTop: '20px' }}>Timer: {localTimer}</div>
            {canDraw && <div id="solution" style={{ marginTop: '20px' }}>Megfejtés: {solution}</div>}
            <div style={{ marginTop: '20px' }}>Aktuális kör: {currentRound}</div>
            <div id="timer-text" style={{ marginTop: '20px' }}>Pontjaim: {myPoints}</div>
        </div>)}
        </div>
    );
}

export default GameField;