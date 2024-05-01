import Leaderboard from './Leaderboard';
import './styles/GameEnd.css';
import { useImage } from 'react-image';
import bgImg from '../../../assets/background.jpg';
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
                opacity: '.6',
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
            <div class="layout-setter">
                <div class="leftdiv">
                    <div class="podium-container">
                        <div class="podium-item"></div>
                        <div class="podium-item arc-text-container">
                            <div class="arc-text">{leaderboardArray[0][0]}</div>
                        </div>
                        <div class="podium-item"></div>
                        <div class="podium-item arc-text-container">
                            <div class="arc-text">
                                {leaderboardArray[1] !== undefined
                                    ? leaderboardArray[1][0]
                                    : ''}
                            </div>
                        </div>
                        <div class="podium-item podium-text">#1</div>
                        <div class="podium-item"></div>
                        <div class="podium-item podium-text">#2</div>
                        <div class="podium-item"></div>
                        <div class="podium-item arc-text-container">
                            <div class="arc-text">
                                {leaderboardArray[2] !== undefined
                                    ? leaderboardArray[2][0]
                                    : ''}
                            </div>
                        </div>
                        <div class="podium-item"></div>
                        <div class="podium-item"></div>
                        <div class="podium-item podium-text">#3</div>
                    </div>
                </div>
                <div className="leaderboard-container">
                    <Leaderboard
                        leaderboardArray={leaderboardArray}
                        localPlayer={localPlayer}
                    />
                </div>
            </div>
            <button className="button" onClick={leaveGamePressed}>
                Vissza a Főoldalra
            </button>
            <BackgroundImage />
        </div>
    );
};

export default GameEnd;
