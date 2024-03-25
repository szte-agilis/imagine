import { useState } from 'react';
import DrawerBoard from './DrawerBoard';
import GuesserBoard from './GuesserBoard';

export default function Board() {
    let [canDraw, setCanDraw] = useState(true);

    function switchBoardType() {
        setCanDraw(!canDraw);
    }

    return (
        <div className="h-[50vh]">
            {canDraw ? <DrawerBoard /> : <GuesserBoard />}
            <button className="btn btn-accent absolute top-0 m-4" onClick={switchBoardType}>Switch board type</button>
        </div>
    );
}