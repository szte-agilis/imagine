import DrawerBoard from './DrawerBoard';
import GuesserBoard from './GuesserBoard';
import {Socket} from 'socket.io-client';

interface BoardProps {
    canDraw: boolean;
}

export default function Board({canDraw, socket}: {canDraw: BoardProps, socket: Socket | null}) {
    return (
        <div className="h-[50vh]">
            {canDraw ? <DrawerBoard socket={socket} /> : <GuesserBoard socket={socket} />}
        </div>
    );
}