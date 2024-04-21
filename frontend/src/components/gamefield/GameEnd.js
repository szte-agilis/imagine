import Leaderboard from "./Leaderboard";
import "./GameEnd.css";

const GameEnd = (props) => {

  const { leaderboardArray, localPlayer } = props;

  return (
    <div id="gameEnd-container">
      <h1>Játék Vége</h1>
      <div class="layout-setter" >
        <div class="leftdiv">
          <div class="podium-container">
            <div class="podium-item"></div>
            <div class="podium-item arc-text-container"><div class="arc-text">{leaderboardArray[0][0]}</div></div>
            <div class="podium-item"></div>
            <div class="podium-item arc-text-container"><div class="arc-text">{leaderboardArray[1] !== undefined ? leaderboardArray[1][0] : ""}</div></div>
            <div class="podium-item podium-text">#1</div>
            <div class="podium-item"></div>
            <div class="podium-item podium-text">#2</div>
            <div class="podium-item"></div>
            <div class="podium-item arc-text-container"><div class="arc-text">{leaderboardArray[2] !== undefined ? leaderboardArray[2][0] : ""}</div></div>
            <div class="podium-item"></div>
            <div class="podium-item"></div>
            <div class="podium-item podium-text">#3</div>
          </div>
        </div>

        <div className="leaderboard-container">
          <Leaderboard leaderboardArray={leaderboardArray} localPlayer={localPlayer} />
        </div>
      </div>

      <button href='http://localhost:3000'>Vissza a Főoldalra</button>

    </div>
  );
}


export default GameEnd;
