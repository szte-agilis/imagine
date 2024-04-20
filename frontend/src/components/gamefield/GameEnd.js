import Leaderboard from "./Leaderboard";
import "./GameEnd.css";

const GameEnd = (props) => {
    
const { leaderboardArray, localPlayer } = props;

  return (
    <div id="gameEnd-container">
      <h1>Játék Vége</h1>
      <div></div>
      <div className="leaderboard-container">
        <Leaderboard leaderboardArray={leaderboardArray} localPlayer={localPlayer} />
      </div>
      <div className="button-container">
        <button variant="primary" href='http://localhost:3000'>Vissza a Főoldalra</button>
      </div>
    </div>
  );
}


export default GameEnd;
