import React, { useState } from 'react';
import './App.css';
import DrawerBoard from './components/DrawerBoard';
import GuesserBoard from './components/GuesserBoard';

function App() {
    let [canDraw, setCanDraw] = useState(true);

    function switchBoardType() {
        canDraw = !canDraw;

        setCanDraw(canDraw)
    }

    return (
        <div style={{ background: '#333333', padding: '10px', height: '100%' }}>
            <button onClick={switchBoardType}>Switch board type</button>
            {canDraw ? <DrawerBoard /> : <GuesserBoard />}
        </div>
    );
}

export default App;
