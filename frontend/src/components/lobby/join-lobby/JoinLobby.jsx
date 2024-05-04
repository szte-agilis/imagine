import React, { useState, useEffect, startTransition } from "react";
import io from 'socket.io-client';
import "./join.css";
import "../common.css";
import { useNavigate } from 'react-router-dom';
import bgImg from '../../../assets/background.jpg';
import logoImg from '../../../assets/imagine-logo.png';
import { useImage } from 'react-image';
import Popup from 'reactjs-popup';

export default function App() {
    const [socket, setSocket] = useState(null);
    const [password, setPassword] = useState('');
    const [warningMessage, setWarningMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!sessionStorage.getItem("username")) {
            startTransition(() => {
                console.error('nincs username megadva', sessionStorage)
                navigate('/');
            })
        }
    }, [navigate]);

    const [lobbies, setLobbies] = useState([])

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);
        newSocket.emit('list-lobbies');

        newSocket.emit('take username', sessionStorage.getItem("username"));

        newSocket.on('list-lobbies', (lobbies) => {
            setLobbies(lobbies);
            console.log(lobbies);
        });

        return () => newSocket.close();
    }, []);

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

    function joinLobby(id) {
        const lobby = lobbies.find(lobby => lobby.id === id);

        if((lobby.password && lobby.password === password) || !lobby.password) {
            if (!lobby.gameStarted) {
                startTransition(() => {
                    sessionStorage.setItem("lobby", id);
                    navigate('/lobby');
                })
            }
        }
        else{
            setWarningMessage("Hibás jelszó!");
        }
    }

    const exit = async () => {
        startTransition(() => {
            navigate("/");
        })
    }

    return (
        <main id="root-join">
            <div id="container-join">
                <div id="header-join" className="bg-gray-700">
                    <p id="header-text-join">Válassz szobát <span id="username-join">{sessionStorage.getItem("username")}</span>!</p>
                </div>
                <div id="lobby-list-join" className="bg-gray-800">
                    {lobbies.map((lobby) => (
                        <div className="lobby bg-gray-700" key={lobby.id}>
                            <p className="lobby-id">ID: {lobby.id}</p>
                            <p className="lobby-id">Lobby név: {lobby.name}</p>
                            <p className="lobby-users">Játékosszám: {lobby.users}</p>
                            <p className="lobby-status">Státusz: {lobby.gameStarted ? 'Játék folyamatban' : 'Várakozás'}</p>
                            <p className="lobby-status">Jelszó: {lobby.password ? 'Van' : 'Nincs'}</p>
                            {!lobby.password && (
                                <button
                                    id="join-lobby-button"
                                    className="btn btn-success join-button"
                                    disabled={lobby.gameStarted}
                                    onClick={() => { joinLobby(lobby.id) } }
                                >
                                    Csatlakozás
                                </button>
                            )}
                            {lobby.password && (
                            <Popup
                                trigger={
                                    <button
                                        id="join-lobby-button"
                                        className="btn btn-success join-button"
                                        disabled={lobby.gameStarted}
                                    >
                                        Csatlakozás
                                    </button>
                                }
                                modal
                                nested
                                onOpen={() => setWarningMessage('')}
                            >
                                {(close) => (
                                    <div className="fixed inset-0 z-50 flex justify-center items-center">
                                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 blur-lg"></div>
                                        <div className="bg-gray-700 rounded-lg shadow-lg p-6 max-w-md relative">
                                            <div className="text-lg font-semibold mb-4">
                                                Add meg a jelszót!
                                            </div>
                                            <div className="flex justify-end popup-body">
                                                {warningMessage && (
                                                <div className="row py-2">
                                                    <p className="font-bold text-red-500">{warningMessage}</p>
                                                </div>)}
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                <input
                                                    type="password"
                                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                                                    value={password}
                                                    onChange={(e) => {
                                                        setPassword(e.target.value);
                                                        setWarningMessage('');
                                                    }}
                                                    placeholder="Jelszó">
                                                </input>

                                                <div className="button-row">
                                                    <button
                                                        id="modal-join-button"
                                                        className="text-md btn btn-success py-2 rounded-lg transition duration-200 border-0"
                                                        disabled={lobby.gameStarted}
                                                        onClick={() => { joinLobby(lobby.id) } }
                                                    >
                                                        Csatlakozás
                                                    </button>
                                                    <button
                                                        className="text-md btn btn-danger bg-red-500 px-4 py-2 text-white hover:bg-red-600 rounded-lg transition duration-200 border-0"
                                                        onClick={close}
                                                    >
                                                        Mégse
                                                    </button>
                                                </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Popup>)}
                        </div>
                    ))}
                </div>
                <div id="shadow-join"></div>
            </div>
            <button id="exit-button" className="btn btn-error" onClick={exit}>Vissza</button>
            <BackgroundImage />
        </main>
    );
}
