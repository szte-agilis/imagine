import React, { useState, startTransition } from "react";
import "./lobby.css";
import bgImg from '../../../assets/background.jpg';
import logoImg from '../../../assets/imagine-logo.png';
import { useImage } from 'react-image';

export default function App() {

    if(sessionStorage.getItem("username") === null || sessionStorage.getItem("username") === undefined || 
        sessionStorage.getItem("lobby") === null || sessionStorage.getItem("lobby") === undefined){
        window.location.href = "/";
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

    return (
        <main>
            <div className="App relative">
            <p id="player-name">{sessionStorage.getItem("username")}</p>
            <p id="lobbyID">{sessionStorage.getItem("lobby")}</p>
            </div>
            <BackgroundImage />
        </main>
    );
}
