import DrawerBoard from './DrawerBoard';
import GuesserBoard from './GuesserBoard';
import {Socket} from 'socket.io-client';

interface BoardProps {
    canDraw: boolean;
}

export default function Board({canDraw, localLobby, socket}: {canDraw: BoardProps, localLobby: string | null, socket: Socket | null}) {
    return (
        <div className="h-[50vh]">
            {canDraw ? <DrawerBoard lobbyId={localLobby} socket={socket} /> : <GuesserBoard socket={socket} />}
        </div>
    );
}