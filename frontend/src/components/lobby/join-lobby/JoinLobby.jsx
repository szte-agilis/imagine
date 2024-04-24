import React, { useState, useEffect, startTransition } from "react";
import io from 'socket.io-client';
import "./join.css";
import "../common.css";
import { useNavigate } from 'react-router-dom';
import bgImg from '../../../assets/background.jpg';
import logoImg from '../../../assets/imagine-logo.png';
import { useImage } from 'react-image';

export default function App() {
    const [socket, setSocket] = useState(null);
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

        if(!lobby.gameStarted){
            startTransition(() => {
                sessionStorage.setItem("lobby", id);
                navigate('/lobby');
            })
        }
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
                            <button className="btn btn-success join-button" onClick={() => {
                                joinLobby(lobby.id);
                            }} disabled={lobby.gameStarted}>Csatlakozás
                            </button>
                        </div>
                    ))}
                </div>
                <div id="shadow-join"></div>
            </div>
            <BackgroundImage />
        </main>
    );
}
