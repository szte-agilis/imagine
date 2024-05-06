import DrawerBoard from './DrawerBoard';
import GuesserBoard from './GuesserBoard';
import {Socket} from 'socket.io-client';

export default function Board({canDraw, lobbyId, socket}: { canDraw: boolean, lobbyId: string | null, socket: Socket | null }) {
    // null check
    // if any of these are null, we got a problem
    if(!socket || !lobbyId){
        return null;
    }

    return (
        <div>
            {canDraw ? <DrawerBoard lobbyId={lobbyId} socket={socket}/> : <GuesserBoard socket={socket}/>}
        </div>
    );
}