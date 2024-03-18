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
            {canDraw ? <DrawerBoard /> : <GuesserBoard />}
            <button style={{display: 'flex', alignItems: 'center', padding: '4px 12px', margin: '8px', backgroundColor: 'lightpink', borderRadius: '4px', borderColor: 'darkred', position: 'absolute', top: 0}} onClick={switchBoardType}>Switch board type</button>
        </div>
    );
}

export default App;
