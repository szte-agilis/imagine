import React, { useState } from 'react';
import './Drawerfield.css';
import DrawerBoard from './DrawerBoard';
import GuesserBoard from './GuesserBoard';

function Drawerfield() {
    let [canDraw, setCanDraw] = useState(true);

    function switchBoardType() {
        canDraw = !canDraw;

        setCanDraw(canDraw);
    }

    return (
        <div
            style={{ background: '#333333', padding: '10px', height: '500px' }}
        >
            {canDraw ? <DrawerBoard /> : <GuesserBoard />}
            <button
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    margin: '8px',
                    backgroundColor: 'lightpink',
                    borderRadius: '4px',
                    borderColor: 'darkred',
                    position: 'absolute',
                    top: 0,
                }}
                onClick={switchBoardType}
            >
                Switch board type
            </button>
        </div>
    );
}

export default Drawerfield;
