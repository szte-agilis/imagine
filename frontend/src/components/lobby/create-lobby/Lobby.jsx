import React, { useState, startTransition, useEffect, useCallback } from 'react';
import "./lobby.css";
import "../common.css";
import bgImg from '../../../assets/background.jpg';
import logoImg from '../../../assets/imagine-logo.png';
import { useNavigate } from 'react-router-dom';
import { useImage } from 'react-image';
import io from 'socket.io-client';

export default function App() {
    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(sessionStorage.getItem('username'));
    const [localLobby, setLocalLobby] = useState(sessionStorage.getItem('lobby'));
    const [lobbyAdmin, setLobbyAdmin] = useState(null);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!sessionStorage.getItem("username") || !sessionStorage.getItem("lobby")) {
            startTransition(() => {
                console.error("Nincsen beállítva username vagy lobby", sessionStorage)
                navigate('/');
            })
        }
    }, [navigate]);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);
        newSocket.emit('create lobby', localLobby, localUsername);

        return () => newSocket.close();
    }, [localLobby, localUsername]);

    useEffect(() => {
        if (socket) {
            socket.on('user list', (usernames) => {
                setUsers(usernames);
                setLobbyAdmin(usernames[0]);
            });

            socket.on('redirect', () => {
                console.log('redirect called via socket.io')
                console.log('lobbyData', JSON.stringify(lobbyData))
                startTransition(() => {
                    sessionStorage.setItem("lobbyData", JSON.stringify(lobbyData));
                    navigate('/gamefield');
                })
            });

            socket.on('change lobby data', (lobbyData) => {
                setLobbyData(lobbyData);
            });

            window.addEventListener('beforeunload', handleBeforeUnload);

            // Remember to clean up the event listener
            return () => {
                socket.off('redirect');
                socket.off('user list');
            };
        }

    }, [socket]);

    useEffect(() => {
        let lobbyDataValid = lobbyDataOnlyValidate();

        if(lobbyDataValid && socket && IsOwner(localUsername)){
            socket.emit('lobby data changed', localLobby, lobbyData);
        }
    });

    const handleBeforeUnload = useCallback((event) => {
        if(socket) {
            socket.emit('window closed', localLobby, localUsername);
        }
        event.returnValue = '';
    }, [socket, localLobby, localUsername]);

    let categories = ["Gyerek", "Felnőtt", "Vicces", "Mém", "Programozó", "Politika"];

    const [LOBBYNAME_MIN, LOBBYNAME_MAX] = [5, 30];
    const [PASSWORD_MIN, PASSWORD_MAX] = [0, 30];
    const [ROUNDS_MIN, ROUNDS_MAX] = [1, 100];
    const [ROUNDTIME_MIN, ROUNDTIME_MAX] = [30, 1200];
    const [MAXPLAYERS_MIN, MAXPLAYERS_MAX] = [2, 64];

    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [lobbyData, setLobbyData] = useState({
        lobbyId: localLobby,
        name: '',
        password: '',
        maxPlayers: 10,
        roundTime: 240,
        rounds: 3,
        category: 'Mém',
    });

    function lobbyDataOnlyValidate() {
        if (lobbyData.name.length < LOBBYNAME_MIN || lobbyData.name.length > LOBBYNAME_MAX) {
            return false;
        }
        if (lobbyData.password.length < PASSWORD_MIN || lobbyData.password.length > PASSWORD_MAX) {
            return false;
        }
        if (lobbyData.rounds < ROUNDS_MIN || lobbyData.rounds > ROUNDS_MAX) {
            return false;
        }
        if (lobbyData.roundTime < ROUNDTIME_MIN || lobbyData.roundTime > ROUNDTIME_MAX) {
            return false;
        }
        if (lobbyData.maxPlayers < MAXPLAYERS_MIN || lobbyData.maxPlayers > MAXPLAYERS_MAX) {
            return false;
        }
        if (!categories.includes(lobbyData.category)) {
            return false;
        }

        return true;
    }

    function lobbyDataValid() {
        if (lobbyData.name.length < LOBBYNAME_MIN || lobbyData.name.length > LOBBYNAME_MAX) {
            setWarningMessage("Nem megfelelő szoba név hossz! [" + LOBBYNAME_MIN + "," + LOBBYNAME_MAX + "] ");
            setShowWarning(true);
            return false;
        }

        if (lobbyData.password.length < PASSWORD_MIN || lobbyData.password.length > PASSWORD_MAX) {
            setWarningMessage("Nem megfelelő jelszó hossz! [" + PASSWORD_MIN + "," + PASSWORD_MAX + "] ");
            setShowWarning(true);
            return false;
        }

        if (lobbyData.rounds < ROUNDS_MIN || lobbyData.rounds > ROUNDS_MAX) {
            setWarningMessage("Nem megfelelő a körök száma! [" + ROUNDS_MIN + "," + ROUNDS_MAX + "] ");
            setShowWarning(true);
            return false;
        }

        if (lobbyData.roundTime < ROUNDTIME_MIN || lobbyData.roundTime > ROUNDTIME_MAX) {
            setWarningMessage("Nem megfelelő a köridő hossza! [" + ROUNDTIME_MIN + "," + ROUNDTIME_MAX + "] ");
            setShowWarning(true);
            return false;
        }

        if (lobbyData.maxPlayers < MAXPLAYERS_MIN || lobbyData.maxPlayers > MAXPLAYERS_MAX) {
            setWarningMessage("Nem megfelelő a maximális játékosok száma! [" + MAXPLAYERS_MIN + "," + MAXPLAYERS_MAX + "] ");
            setShowWarning(true);
            return false;
        }

        if (!categories.includes(lobbyData.category)) {
            setWarningMessage("Nem megfelelő kategória!");
            setShowWarning(true);
            return false;
        }

        return true;
    }

    const handleFormChange = async (e) => {
        const { name, value } = e.target;
        setLobbyData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFormChangeOnBlur = async (e) => {
        lobbyDataValid();
    };

    function IsOwner(testedUser) {
        return lobbyAdmin === testedUser;
    }

    function EnoughPlayers() {
        return users && users.length > 1
    }

    function BackgroundImage() {
        const { src } = useImage({
            srcList: [bgImg, 'https://cdn.wallpapersafari.com/69/10/CEokAi.jpg'],
        });

        return (
            <div
                className="background-image"
                style={{
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: -1,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'black'
                }}
            ><div
                className="background-image"
                style={{
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: -1,
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: '.6'
                }}
            ></div>
            </div>
        );
    }
    function LogoImage() {
        const { src } = useImage({
            srcList: [logoImg, 'https://i.pinimg.com/736x/3e/f0/ee/3ef0ee4a246747e96ab8d7816780eb0b.jpg'],
        });

        return (
            <div
                id="logo"
                className="logo-image"
                style={{
                    overflow: 'hidden',
                    zIndex: 0,
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    aspectRatio: 2.5
                }}
            ></div>
        );
    }

    function PlayerList() {
        return (
            <div id="player-list">
                <div id="player-count-div" className="bg-gray-700">
                    <p>{users.length} Játékos</p>
                </div>
                <div id="list-column" className="bg-gray-800">
                    {users.map((user, index) => (
                        <div className="player-item bg-gray-700" key={index}>
                            <p className={user === sessionStorage.getItem("username") ? 'this-player-item' : ''}>{user}</p>
                            {IsOwner(user) ?
                                <svg xmlns="http://www.w3.org/2000/svg" className="crown-svg" viewBox="0 0 576 512"><path d="M576 136c0 22.09-17.91 40-40 40c-.248 0-.4551-.1266-.7031-.1305l-50.52 277.9C482 468.9 468.8 480 453.3 480H122.7c-15.46 0-28.72-11.06-31.48-26.27L40.71 175.9C40.46 175.9 40.25 176 39.1 176c-22.09 0-40-17.91-40-40S17.91 96 39.1 96s40 17.91 40 40c0 8.998-3.521 16.89-8.537 23.57l89.63 71.7c15.91 12.73 39.5 7.544 48.61-10.68l57.6-115.2C255.1 98.34 247.1 86.34 247.1 72C247.1 49.91 265.9 32 288 32s39.1 17.91 39.1 40c0 14.34-7.963 26.34-19.3 33.4l57.6 115.2c9.111 18.22 32.71 23.4 48.61 10.68l89.63-71.7C499.5 152.9 496 144.1 496 136C496 113.9 513.9 96 536 96S576 113.9 576 136z" /></svg>
                                : ''}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    function hideWarning() {
        let warning = document.getElementById("warning");
        warning.classList.remove("animated-warning");
        warning.animate(
            [
                { transform: 'scale(1)' },
                {
                    transform: 'scale(0)',
                    opacity: 0
                }
            ],
            {
                duration: 150,
                easing: 'ease-in',
                fill: 'forwards'
            }
        ).onfinish = () => setShowWarning(false);
    }

    const start = async (event) => {
        event.preventDefault();

        if (!IsOwner(localUsername)) return;

        if (!EnoughPlayers()) {
            setWarningMessage("Nincs elegendő játékos! Minimum: 2");
            setShowWarning(true);
            return;
        }

        if(!lobbyDataValid()){
            return;
        }

        window.removeEventListener('beforeunload', handleBeforeUnload);
        socket.emit('start game clicked', localLobby);
    }

    const exit = async () => {
        startTransition(() => {
            navigate("/");
        })
    }

    return (
        <main>
            {showWarning && IsOwner(localUsername) &&
                <div id="warning" className="absolute z-50 pointer-events-none w-full text-center py-4 lg:px-4 animated-warning">
                    <div id='warning-msg' className="p-2 bg-red-100 items-center text-red-700 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
                        <span className="flex rounded-full bg-red-200 uppercase px-2 py-1 text-xs font-bold mr-3">Hoppá!</span>
                        <span className="font-semibold mr-2 text-left flex-auto text-red-500">{warningMessage}</span>
                        <svg id="warning-svg" onClick={hideWarning} className="cursor-pointer pointer-events-auto fill-current opacity-75 h-6 w-6 transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none max-w-[40px] max-h-[40px] text-xs hover:bg-gray-900/10 active:bg-gray-900/20 rounded-full " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                    </div>
                </div>
            }
            <div id="lobby-div" className="App relative">
                <PlayerList />
                <div id="center-column">
                    <LogoImage />
                    <button id="start-button" className={"btn btn-success disabled:bg-emerald-900" + (IsOwner(localUsername)?'':' opacity-60')} onClick={start} disabled={!IsOwner(localUsername) || !EnoughPlayers()}>Start</button>
                    <button id="exit-button" className="btn btn-error" onClick={exit}>Kilépés</button>
                </div>
                <div id="settings">
                    <div id="form-header" className="bg-gray-700">
                        <p>Beállítások</p>
                    </div>
                    <div className="mx-auto bg-gray-800" id="settings-column">
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="lobbyId" id="lobbyId"
                                   className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    required
                                    disabled
                                   value={lobbyData.lobbyId}
                                   onChange={handleFormChange}
                                   onBlur={handleFormChangeOnBlur}
                            />
                            <label htmlFor="lobbyId"
                                   className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]">Lobby ID</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="name" id="name" disabled={!IsOwner(localUsername)}
                                   className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                   required
                                   value={lobbyData.name}
                                   onChange={handleFormChange}
                                   onBlur={handleFormChangeOnBlur}
                                   minLength={LOBBYNAME_MIN}
                                   maxLength={LOBBYNAME_MAX}
                            />
                            <label htmlFor="name"
                                   className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]">Szobanév*</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="password" name="password" id="password" disabled={!IsOwner(localUsername)}
                                   class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                   placeholder=" "
                                   value={lobbyData.password}
                                   onChange={handleFormChange}
                                   onBlur={handleFormChangeOnBlur}
                                   minLength={PASSWORD_MIN}
                                   maxLength={PASSWORD_MAX}
                            />
                            <label htmlFor="password"
                                   className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]">Jelszó</label>
                        </div>
                        <div className="grid md:grid-cols-3 md:gap-6">
                            <div className="relative z-0 w-full mb-5 group">
                                <input type="number" name="rounds" id="rounds" disabled={!IsOwner(localUsername)}
                                       class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                       placeholder=" " required
                                       value={lobbyData.rounds}
                                       onChange={handleFormChange}
                                       onBlur={handleFormChangeOnBlur}
                                       min={ROUNDS_MIN}
                                       max={ROUNDS_MAX}
                                />
                                <label htmlFor="rounds"
                                       className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]">Körszám</label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input type="number" name="roundTime" id="roundTime" disabled={!IsOwner(localUsername)}
                                       class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                       placeholder=" " required
                                       value={lobbyData.roundTime}
                                       onChange={handleFormChange}
                                       onBlur={handleFormChangeOnBlur}
                                       min={ROUNDTIME_MIN}
                                       max={ROUNDTIME_MAX}
                                />
                                <label htmlFor="roundTime"
                                       className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]">Köridő</label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input type="number" name="maxPlayers" id="maxPlayers"
                                       disabled={!IsOwner(localUsername)}
                                       class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                       placeholder=" " required
                                       value={lobbyData.maxPlayers}
                                       onChange={handleFormChange}
                                       onBlur={handleFormChangeOnBlur}
                                       min={MAXPLAYERS_MIN}
                                       max={MAXPLAYERS_MAX}
                                />
                                <label htmlFor="maxPlayers"
                                       className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]">Játékosszám</label>
                            </div>
                        </div>
                        <label htmlFor="category"
                               className="block mb-2 text-sm font-medium text-gray-500 dark:text-white"><p
                            id="category-p">Kategória</p>
                            <select id="category" name="category" disabled={!IsOwner(localUsername)}
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={lobbyData.category}
                                    onChange={handleFormChange}
                                    onBlur={handleFormChangeOnBlur}
                            >
                                {categories.map((categ, index) => (
                                    <option key={index} value={categ}>{categ}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            </div>
            <BackgroundImage />
        </main>
    );
}
