import React from 'react';

class Leaderboard extends React.Component {
  render() {
    
    const { leaderboardArray } = this.props;
    if (leaderboardArray.length === 0) {
        return null;
    }
    console.log(leaderboardArray);

    leaderboardArray.sort((a, b) => b[1] - a[1]);

    return (
      <div>
        <h2>Leaderboard</h2>
        <ul>
          {leaderboardArray.map(([name, points], index) => (
            <li key={index}>
              {name}: {points}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Leaderboard;