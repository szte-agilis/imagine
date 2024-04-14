import React, { useState, useEffect } from "react";
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
        if (!sessionStorage.getItem("username") || !sessionStorage.getItem("lobby")) {
            navigate('/');
        }
    }, [navigate]);

    const [lobbies, setLobbies] = useState([])

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);
        newSocket.emit('list-lobbies');

        newSocket.on('list-lobbies', (lobbies) => {
            setLobbies(lobbies);
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
    function LogoImage() {
        const { src } = useImage({
            srcList: [logoImg, 'https://i.pinimg.com/736x/3e/f0/ee/3ef0ee4a246747e96ab8d7816780eb0b.jpg'],
        });

        return (
            <div
                className="logo-image"
                style={{
                    overflow: 'hidden',
                    zIndex: 0,
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '25vw',
                    aspectRatio: 2.5
                }}
            ></div>
        );
    }

    function joinLobby(id) {
        const lobby = lobbies.find(lobby => lobby.id === id);

        if(!lobby.gameStarted){
            sessionStorage.setItem("lobby", id);
            navigate('/lobby');
        }
    }

    return (
        <main>
            <div className="App relative">
                <p id="player-name">{sessionStorage.getItem("username")}</p>
                <div className="lobby-list">
                    {lobbies.map((lobby) => (
                        <div className="lobby" key={lobby.id}>
                            <p className="lobby-id">ID: {lobby.id}</p>
                            <p className="lobby-users">Number of Users: {lobby.users}</p>
                            <p className="lobby-status">Státusz: {lobby.gameStarted ? 'Játék folyamatban' : 'Várakozás'}</p>
                            <button className="btn btn-success" onClick={() => {joinLobby(lobby.id)}} disabled={lobby.gameStarted}>Csatlakozás</button>
                        </div>
                    ))}
                </div>
            </div>
            <BackgroundImage />
        </main>
    );
}
