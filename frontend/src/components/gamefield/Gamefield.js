import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Board from '../drawerfield/Board';
import Leaderboard from './Leaderboard';
import './Gamefield.css';
import './GameEnd.js';
import GameEnd from './GameEnd.js';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';

function GameField() {
    const lobbyData = JSON.parse(sessionStorage.getItem('lobbyData'));
    const rounds = lobbyData.rounds;
    const [points, setPoints] = useState([]);

    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(
        sessionStorage.getItem('username')
    );
    const [localLobby, setLocalLobby] = useState(
        sessionStorage.getItem('lobby')
    );
    const [chatInput, setChatInput] = useState('');
    const [currentRound, setCurrentRound] = useState(1);
    const [messages, setMessages] = useState([]);
    const [showWarning, setShowWarning] = useState(false);
    const [canDraw, setCanDraw] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const [localTimer, setlocalTimer] = useState(lobbyData.roundTime);
    const chatWindow = document.getElementById('chat-window');
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [guessSet, setGuessSet] = useState(true);
    const [showCorrectGuessAnimation, setShowCorrectGuessAnimation] =
        useState(false);
    const [correctGuessInfo, setCorrectGuessInfo] = useState(null);
    const navigate = useNavigate();

    const [solution, setSolution] = useState('');
    const [randomSolutions, setRandomSolutions] = useState([]);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);

        newSocket.emit('join lobby', localLobby, localUsername);
        newSocket.on('lobby not exists', () => {
            window.location.href = '/';
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on(
                'chat message',
                ({ message, guessedCorrectly, username }) => {
                    const messageElement = document.createElement('div');
                    if (username === localUsername && guessedCorrectly) {
                        messageElement.textContent = 'Kitaláltad!';
                    } else {
                        messageElement.textContent = message;
                    }

                    if (guessedCorrectly) {
                        handleCorrectGuess(username);
                        if (username === localUsername) {
                            messageElement.classList.add('current-player');
                        } else if (username !== localUsername) {
                            messageElement.classList.add('other-player');
                        }
                    }

                    if (chatWindow !== null) {
                        chatWindow.appendChild(messageElement);
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    }
                }
            );

            socket.on('Drawer', (canDraw) => {
                setCanChat(!canDraw);
                setCanDraw(canDraw);
                if (canDraw === true) {
                    setGuessSet(false);
                }
                setSolution();
            });

            socket.on('new round', (currentRound) => {
                setCurrentRound(currentRound);
                if (rounds + 1 === currentRound) {
                    setIsGameEnded(true);
                }
            });

            socket.on('user list', (usernames) => {
                console.log(usernames);
            });
            socket.emit('init-points', localLobby);

            socket.on('points', (pointsObject) => {
                setPoints(pointsObject);

                const localUserPoints = pointsObject.find(
                    ([username]) => username === localUsername
                );
                if (localUserPoints) {
                    const localUserPointsSum = localUserPoints[1];
                    const overtaken = pointsObject.some(
                        ([username, points]) =>
                            username !== localUsername &&
                            points > localUserPointsSum
                    );
                    if (overtaken) {
                        setShowWarning(true);
                    }
                }
            });

            socket.on('timer', (time) => {
                setlocalTimer(time);
            });

            socket.on('clearChat', () => {
                chatWindow.innerHTML = '';
            });

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
            setSolution('');
        }
    };

    const handleCorrectGuess = (username) => {
        setCorrectGuessInfo(username);
        setShowCorrectGuessAnimation(true);
        setTimeout(() => {
            setShowCorrectGuessAnimation(false);
        }, 3000); // Hide the animation after 3 seconds
    };

    const startGameTimer = (pickedSolution) => {
        if (socket && localLobby) {
            setGuessSet(true);
            socket.emit('startGame', {
                lobbyId: localLobby,
                pickedSolution: pickedSolution,
            });
            //socket.emit('startGame', localLobby);
            setRandomSolutions([]);
        }
    };

    const clearChat = () => {
        if (socket) {
            socket.emit('clearChat', localLobby);
        }
    };
    const getposition = (points) => {
        let c1 = 0;
        points.sort((a, b) => b[1] - a[1]);
        console.log('pointsArray: ' + points);
        points.map((username, point) => {
            if (username[0] !== localUsername) {
                c1++;
            }
        });
        return c1;
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

    function hideWarning() {
        let warning = document.getElementById('warning');
        warning.classList.remove('animated-warning');
        warning.animate(
            [
                { transform: 'scale(1)' },
                {
                    transform: 'scale(0)',
                    opacity: 0,
                },
            ],
            {
                duration: 150,
                easing: 'ease-in',
                fill: 'forwards',
            }
        ).onfinish = () => setShowWarning(false);
    }

    const leaveGamePressed = () => {
        setIsGameEnded(true);
    };

    return (
        <div id="container">
            {showWarning && (
                <div
                    id="warning"
                    className="absolute z-50 pointer-events-none w-full text-center py-4 lg:px-4 animated-warning"
                >
                    <div
                        id="warning-msg"
                        className="p-2 bg-red-100 items-center text-red-700 leading-none lg:rounded-full flex lg:inline-flex"
                        role="alert"
                    >
                        <span className="flex rounded-full bg-red-200 uppercase px-2 py-1 text-xs font-bold mr-3">
                            Hoppá!
                        </span>
                        <span className="font-semibold mr-2 text-left flex-auto text-red-500">
                            "Hoppá, megelőztek!"
                        </span>
                        <svg
                            id="warning-svg"
                            onClick={hideWarning}
                            className="cursor-pointer pointer-events-auto fill-current opacity-75 h-6 w-6 transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none max-w-[40px] max-h-[40px] text-xs hover:bg-gray-900/10 active:bg-gray-900/20 rounded-full "
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                        </svg>
                    </div>
                </div>
            )}
            {isGameEnded ? (
                <GameEnd
                    leaderboardArray={points}
                    localPlayer={localUsername}
                />
            ) : (
                <div>
                    <div>
                        <div className="header-bar">
                            <div className="first-three ">
                                Round ( {currentRound} / {rounds} )
                            </div>
                            <div className="first-three ">
                                Time: {localTimer}
                            </div>
                            <div className="first-three " id="lobby-id">
                                Lobby kód: {localLobby}
                            </div>
                            <div className="fourth">Imagine</div>
                        </div>
                        <div id="gamefield-container">
                            <div id="left-container">
                                <Leaderboard
                                    leaderboardArray={points}
                                    localPlayer={localUsername}
                                />

                                <Popup
                                    trigger={
                                        <button
                                            id="leave-button"
                                            className="button_class"
                                        >
                                            Meccs elhagyása
                                        </button>
                                    }
                                    modal
                                    nested
                                >
                                    {(close) => (
                                        <div
                                            style={{
                                                overlay: { zIndex: 1000 },
                                            }}
                                            id="leave-popup"
                                        >
                                            <div className="content">
                                                {' '}
                                                Biztosan feladod a játékot?
                                            </div>

                                            <div className="modal-button-container">
                                                <button
                                                    id="modal-leave-button"
                                                    onClick={leaveGamePressed}
                                                >
                                                    Kilépés
                                                </button>
                                                <button
                                                    className="modal-cancel-button"
                                                    onClick={() => {
                                                        close();
                                                    }}
                                                >
                                                    Mégse
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Popup>

                                {canDraw && randomSolutions.length > 0 && (
                                    <div>
                                        <h2>Choose a solution:</h2>
                                        {randomSolutions.map(
                                            (solution, index) => (
                                                <button
                                                    id={index.toString()}
                                                    className="button_class"
                                                    key={index}
                                                    onClick={() => {
                                                        startGameTimer(
                                                            solution
                                                        );
                                                        clearChat();
                                                        setSolution(solution);
                                                    }}
                                                >
                                                    {solution}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                                {canDraw && solution && (
                                    <div id="solution" className="div_style">
                                        Megfejtés: {solution}
                                    </div>
                                )}
                            </div>
                            <div id="middle-div">
                                <Board
                                    canDraw={guessSet && canDraw}
                                    localLobby={localLobby}
                                    socket={socket}
                                />
                            </div>
                            <div
                                id="chat-container"
                                className={
                                    correctGuessInfo &&
                                    localUsername === correctGuessInfo &&
                                    showCorrectGuessAnimation
                                        ? 'flash-chat'
                                        : ''
                                }
                            >
                                <div id="chat-window"></div>
                                <label htmlFor="chat-input"></label>
                                {correctGuessInfo &&
                                    localUsername === correctGuessInfo &&
                                    showCorrectGuessAnimation && (
                                        <div className="guessed-message">
                                            Sikeresen kitaláltad!
                                        </div>
                                    )}
                                {canChat && (
                                    <input
                                        id="chat-input"
                                        type="text"
                                        value={chatInput}
                                        className="input-style"
                                        placeholder="Type a message and press Enter"
                                        onKeyPress={handleChatInputKeyPress}
                                        onChange={(event) =>
                                            setChatInput(event.target.value)
                                        }
                                    />
                                )}
                                {canDraw && (
                                    <button
                                        id="passDrawerButton"
                                        className="button_class"
                                        onClick={handlePassDrawer}
                                    >
                                        Pass Drawer Role
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameField;
