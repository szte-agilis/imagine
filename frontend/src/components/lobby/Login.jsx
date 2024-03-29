import React, { useState, startTransition, useEffect } from "react";
import "./Login.css";
import "./common.css";
import bgImg from '../../assets/background.jpg';
import logoImg from '../../assets/imagine-logo.png';
import { useImage } from 'react-image';

export default function App() {
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const MAX_NAME_LENGTH = 15;

    const [username, setUsername] = useState("");

    useEffect(() => {
        const storedUsername = sessionStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
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

    const joinLobby = async (event) => {
        event.preventDefault();

        if (username.trim() === "") {
            setWarningMessage("Nem adtál meg nevet.");
            setShowWarning(true);
            return;
        }

        if (username.trim().length > MAX_NAME_LENGTH) {
            setWarningMessage("Túl hosszú nevet adtál meg! Max: 15 karakter.");
            setShowWarning(true);
            return;
        }

        setShowWarning(false);
        sessionStorage.setItem("username", username);
        window.location.href = "/join";
    };

    const createLobby = async (event) => {
        event.preventDefault();

        if (username.trim() === "") {
            setWarningMessage("Nem adtál meg nevet.");
            setShowWarning(true);
            return;
        }

        if (username.trim().length > MAX_NAME_LENGTH) {
            setWarningMessage("Túl hosszú nevet adtál meg! Max: 15 karakter.");
            setShowWarning(true);
            return;
        }

        var min = 100000;
        var max = 999999;
        let number = Math.floor(Math.random() * (max - min + 1)) + min;
        startTransition(() => {
            sessionStorage.setItem("lobby", number);
            sessionStorage.setItem("username", username.trim());
            window.location.href = "/lobby";
        });
    }

    return (
        <main>
            <div className="App relative">
                {showWarning &&
                    <div id="warning" className="absolute w-full text-center py-4 lg:px-4 animated-warning">
                        <div className="p-2 bg-red-100 items-center text-red-700 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
                            <span className="flex rounded-full bg-red-200 uppercase px-2 py-1 text-xs font-bold mr-3">Hoppá!</span>
                            <span className="font-semibold mr-2 text-left flex-auto text-red-500">{warningMessage}</span>
                            <svg id="warning-svg" onClick={hideWarning} className="cursor-pointer fill-current opacity-75 h-6 w-6 transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none max-w-[40px] max-h-[40px] text-xs hover:bg-gray-900/10 active:bg-gray-900/20 rounded-full " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                        </div>
                    </div>
                }
                <div className="lobby-container">
                    <LogoImage className="animate animate-tada" />
                    <input
                        type="text"
                        placeholder="Név"
                        className="input input-bordered w-full max-w-xs"
                        id="name"
                        maxLength={15}
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                        }}
                    />
                    <div className="btn-container">
                        <button id="join-lobby" className="rounded-md border bg-gray-800 btn btn-success btn-lobby" onClick={joinLobby}>
                            <p>Csatlakozás Szobához</p>
                        </button>
                        <button id="create-lobby" className="btn rounded-md border bg-gray-800 btn btn-success btn-lobby" onClick={createLobby}>
                            <p>Szoba Létrehozása</p>
                        </button>
                    </div>
                </div>
            </div>
            <BackgroundImage />
        </main>
    );
}
