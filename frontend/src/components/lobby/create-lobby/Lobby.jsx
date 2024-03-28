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

    let players = [{name: "Lajoska23hun"},{name: "ödön a bödön"},{name: sessionStorage.getItem("username")},{name: "nemláttammá"},{name: "AAAAAAAAAAAA"},{name: "szivattyú"},{name: "nemláttammá"},{name: "AAAAAAAAAAAA"},{name: "szivattyú"},{name: "nemláttammá"},{name: "AAAAAAAAAAAA"},{name: "szivattyú"}];
    let owner = sessionStorage.getItem("username");

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
                    width: '25vw',
                    aspectRatio: 2.5
                }}
            ></div>
        );
    }

    function PlayerList() {
        return (
            <div id="player-list">
                <div id="player-count-div" className="bg-gray-700">
                      <p>Játékosok száma: {players.length}</p>
                </div>
                <div id="list-column" className="bg-gray-800">
                    {players.map((player, index) => (
                        <div className="player-item bg-gray-700" key={index}>
                            <p className={player.name === sessionStorage.getItem("username") ? 'this-player-item' : ''}>{player.name}</p>
                            {owner === player.name? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="crown-svg" viewBox="0 0 576 512"><path d="M576 136c0 22.09-17.91 40-40 40c-.248 0-.4551-.1266-.7031-.1305l-50.52 277.9C482 468.9 468.8 480 453.3 480H122.7c-15.46 0-28.72-11.06-31.48-26.27L40.71 175.9C40.46 175.9 40.25 176 39.1 176c-22.09 0-40-17.91-40-40S17.91 96 39.1 96s40 17.91 40 40c0 8.998-3.521 16.89-8.537 23.57l89.63 71.7c15.91 12.73 39.5 7.544 48.61-10.68l57.6-115.2C255.1 98.34 247.1 86.34 247.1 72C247.1 49.91 265.9 32 288 32s39.1 17.91 39.1 40c0 14.34-7.963 26.34-19.3 33.4l57.6 115.2c9.111 18.22 32.71 23.4 48.61 10.68l89.63-71.7C499.5 152.9 496 144.1 496 136C496 113.9 513.9 96 536 96S576 113.9 576 136z"/></svg> 
                            : ''}
                        </div>
                     ))}
                </div>
            </div>
        );
    }

    function Settings() {
        return (
            <div id="settings-column" className="bg-gray-800">
            </div>
        );
    }

    const start = async (event) => {
        event.preventDefault();

        //io.emit("start lobby");
        window.location.href = "/gamefield";
    }   

    const exit = async (event) => {
        event.preventDefault();

        //io.emit("exit lobby");
        window.location.href = "/";
    }   

    return (
        <main>
            <div id="lobby-div" className="App relative">
                <PlayerList/>
                <div id="center-column">
                    <LogoImage/>
                    <button id="start-button" className="btn btn-success" onClick={start}>Start</button>
                    <button id="exit-button" className="btn btn-error" onClick={exit}>Kilépés</button>
                </div>
                <Settings/>
            </div>
            <BackgroundImage />
        </main>
    );
}
