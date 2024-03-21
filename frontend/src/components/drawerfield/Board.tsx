import { useState } from 'react';
import DrawerBoard from './DrawerBoard';
import GuesserBoard from './GuesserBoard';

export default function Board() {
    let [canDraw, setCanDraw] = useState(true);

    function switchBoardType() {
        setCanDraw(!canDraw);
    }

    return (
        <div style={{height: '50vh'}}>
            {canDraw ? <DrawerBoard /> : <GuesserBoard />}
            <button
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    margin: '20px',
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