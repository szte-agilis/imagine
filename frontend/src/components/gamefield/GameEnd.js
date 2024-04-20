import Leaderboard from "./Leaderboard";
import "./GameEnd.css";

const GameEnd = (props) => {

  const { leaderboardArray, localPlayer } = props;

  return (
    <div id="gameEnd-container">
      <h1>Játék Vége</h1>
      <div class="layout-setter" >
        <div class="podium-container">
          <div class="colored-div left"></div>
          <div class="colored-div middle"></div>
          <div class="colored-div right"></div>
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
