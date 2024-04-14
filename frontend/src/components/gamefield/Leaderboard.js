import "./Leaderboard.css";

const Leaderboard = (props) => {

  const { leaderboardArray, localPlayer } = props;
  if (leaderboardArray.length === 0) {
    return null;
  }

  leaderboardArray.sort((a, b) => b[1] - a[1]);

  return (
    <div id="leaderborad-container">
      <h2>Leaderboard</h2>
      <div>
        {leaderboardArray.map(([name, points], index) => (
          <div id="container-lbd" className={name === localPlayer ? 'localPlayer' : ''} key={index}>
            <div id="left-square-lbd">
              #{index + 1}
            </div>
            <div id="right-rectangles-lbd">
              <div className="top-rectangle-lbd">
                {name}
              </div>
              <div className="bottom-rectangle-lbd">
                {points}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default Leaderboard;