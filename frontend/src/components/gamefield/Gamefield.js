import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Board from '../drawerfield/Board';
import Leaderboard from './components/Leaderboard';
import './Gamefield.css';
import GameEnd from './components/GameEnd.js';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import TopicLengthContainer from './components/topicLengthContainer.js';
import imagineLogo from '../../assets/imagine-logo.png';

function GameField() {
    const [rounds, setRounds] = useState(0);
    const [points, setPoints] = useState([]);

    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(
        sessionStorage.getItem('username')
    );
    const [localLobby, setLocalLobby] = useState(
        sessionStorage.getItem('lobby')
    );
    const [chatInput, setChatInput] = useState('');
    const [currentRound, setCurrentRound] = useState(0);
    const [messages, setMessages] = useState([]);
    const [canDraw, setCanDraw] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const [localTimer, setlocalTimer] = useState(0);
    const chatWindow = document.getElementById('chat-window');
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [guessSet, setGuessSet] = useState(true);
    const [isChoosingSolution, setIsChoosingSolution] = useState(false);
    const [showCorrectGuessAnimation, setShowCorrectGuessAnimation] =
        useState(false);
    const [correctGuessInfo, setCorrectGuessInfo] = useState(null);
    const [correctGuessers, setCorrectGuessers] = useState([]);
    const navigate = useNavigate();

    const [solution, setSolution] = useState(null);
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
                        setCorrectGuessers((prevGuessers) => [
                            ...prevGuessers,
                            username,
                        ]);
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
                setSolution(null);
            });

            socket.on('new round', () => {
                setCorrectGuessers([]);
            });

            socket.on('new drawer change', () => {
                setIsChoosingSolution(true);
            });

            socket.on('game started', () => {
                setIsChoosingSolution(false);
            });

            socket.on('game-data-sent', (lobby) => {
                setRounds(lobby.rounds);
                setlocalTimer(lobby.timer);
                setCurrentRound(lobby.currentRound);
                console.log(lobby.currentRound, ' és ', lobby.rounds);
                if (lobby.currentRound - 1 === lobby.rounds) {
                    setIsGameEnded(true);
                }
            });

            socket.on('user list', (usernames) => {
                console.log(usernames);
            });
            socket.emit('init-points', localLobby);

            socket.on('points', (pointsObject) => {
                setPoints(pointsObject);
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
            setSolution(null);
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
            setCorrectGuessers([]);
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
                if (!isChoosingSolution || (isChoosingSolution && canDraw)) {
                    if (!correctGuessers.includes(localUsername)) {
                        socket.emit('chat message', localLobby, message);
                    }
                    setChatInput('');
                }
            }
        }
    };

    const leaveGamePressed = () => {
        setIsGameEnded(true);
    };

    return (
        <div id="container">
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
                                Kör ( {currentRound} / {rounds} )
                            </div>
                            <div className="first-three ">
                                Idő: {localTimer}
                            </div>
                            <div className="first-three " id="lobby-id">
                                Lobby kód: {localLobby}
                            </div>
                            <div className="fourth">
                                <img
                                    src={imagineLogo}
                                    alt="Imagine"
                                    className="ilogo"
                                />
                            </div>
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
                                        <div className="fixed inset-0 z-50 flex justify-center items-center">
                                            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 blur-lg"></div>
                                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md relative">
                                                <div className="text-lg font-semibold mb-4">
                                                    Biztosan feladod a játékot?
                                                </div>
                                                <div className="flex justify-end space-x-4">
                                                    <button
                                                        id="modal-leave-button"
                                                        onClick={
                                                            leaveGamePressed
                                                        }
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                                                    >
                                                        Kilépés
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                                                        onClick={close}
                                                    >
                                                        Mégse
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Popup>

                                {canDraw && randomSolutions.length > 0 && (
                                    <div>
                                        <div className="modal-background">
                                            <div className="modal-content">
                                                <h2>
                                                    Válassz mit szeretnél
                                                    rajzolni:
                                                </h2>
                                                <br />
                                                {randomSolutions.map(
                                                    (solution, index) => (
                                                        <button
                                                            id={index.toString()}
                                                            className="solution-button"
                                                            key={index}
                                                            onClick={() => {
                                                                startGameTimer(
                                                                    solution
                                                                );
                                                                clearChat();
                                                                setCorrectGuessers(
                                                                    []
                                                                );
                                                                setSolution(
                                                                    solution
                                                                );
                                                            }}
                                                        >
                                                            {solution.solution}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div id="middle-div">
                                <Board
                                    canDraw={guessSet && canDraw}
                                    lobbyId={localLobby}
                                    socket={socket}
                                />
                                <TopicLengthContainer
                                    solution={solution}
                                    guessed={
                                        (correctGuessInfo &&
                                            localUsername ===
                                                correctGuessInfo &&
                                            showCorrectGuessAnimation) ||
                                        (canDraw && solution)
                                    }
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
                                        placeholder="Írj valamit!"
                                        onKeyPress={handleChatInputKeyPress}
                                        onChange={(event) =>
                                            setChatInput(event.target.value)
                                        }
                                    />
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
