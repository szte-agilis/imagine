import React, { useState, startTransition } from "react";
import "./join.css";
import "../common.css";
import bgImg from '../../../assets/background.jpg';
import logoImg from '../../../assets/imagine-logo.png';
import { useImage } from 'react-image';

export default function App() {

    if (sessionStorage.getItem("username") === null || sessionStorage.getItem("username") === undefined) {
        window.location.href = "/";
    }

    const [lobbyID, setLobbyID] = useState(100000);
    const lobbies = [{ id: 123456, users: 6 }, { id: 234567, users: 1 }]

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

    const joinLobby = async (event) => {
        event.preventDefault();
        sessionStorage.setItem("lobby", lobbyID)
        window.location.href = "/lobby";
    };


    return (
        <main>
            <div className="App relative">
                <p id="player-name">{sessionStorage.getItem("username")}</p>
                <input
                    type="text"
                    placeholder="Lobby azonosító"
                    className="input input-bordered w-full max-w-xs"
                    id="lobbID"
                    value={lobbyID}
                    onChange={(e) =>
                        setLobbyID(e.target.value)
                    }
                />
                <button className="btn btn-success" onClick={joinLobby}>Csatlakozás</button>
                <div>
                    {lobbies.map((lobby) => (
                        <div key={lobby.id}>
                            <p>Lobby ID: {lobby.id}</p>
                            <p>Number of Users: {lobby.users}</p>
                            <button className="btn btn-success" onClick={() => setLobbyID(lobby.id)}>Kijelölés</button>
                        </div>
                    ))}
                </div>
            </div>
            <BackgroundImage />
        </main>
    );
}
