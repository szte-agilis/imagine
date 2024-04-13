import React from 'react';
import "./Leaderboard.css";

class Leaderboard extends React.Component {
  render() {
    
    const { leaderboardArray } = this.props;
    if (leaderboardArray.length === 0) {
        return null;
    }
    console.log(leaderboardArray);

    leaderboardArray.sort((a, b) => b[1] - a[1]);

    return (
      <div id="leaderborad-container">
        <h2>Leaderboard</h2>
        <div>
          {leaderboardArray.map(([name, points], index) => (
            <div id="container-lbd">
            <div id="left-square-lbd">
                #{index+1}
            </div>
            <div id="right-rectangles-lbd">
                <div class="top-rectangle-lbd">
                    {name}
                </div>
                <div class="bottom-rectangle-lbd">
                    {points}
                </div>
            </div>
        </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Leaderboard;