import Leaderboard from "./Leaderboard";
import "./GameEnd.css";
import { useImage } from "react-image"; // Ha a react-image modul ténylegesen ezt exportálja
import React from "react"; // Importáld a Reactot a tényleges modulból, nem a típusdefiníciós csomagból
import bgImg from "../../assets/background.jpg";
import { useNavigate } from 'react-router-dom';



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
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: 'black',
                opacity: '.6'
            }}
        ></div>
    );
}

const GameEnd = (props) => {
    const { leaderboardArray, localPlayer } = props;

    const navigate = useNavigate();

    const leaveGamePressed = () => {
        navigate('/');
    };

    return (
        <div id="gameEnd-container">
            <h1 className="game-end-heading">Játék Vége</h1>
            <div className="layout-setter">
                <div className="podium-container">
                    <div className="colored-div left"></div>
                    <div className="colored-div middle"></div>
                    <div className="colored-div right"></div>
                </div>
                <div className="leaderboard-container">
                    <Leaderboard leaderboardArray={leaderboardArray} localPlayer={localPlayer} />
                </div>
            </div>
            <button
                className="button"
                onClick={leaveGamePressed}
            >
                Vissza a Főoldalra
            </button>
            <BackgroundImage />
        </div>
    );
}

export default GameEnd;
