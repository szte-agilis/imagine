import DrawerBoard from './DrawerBoard';
import GuesserBoard from './GuesserBoard';

interface BoardProps {
    canDraw: boolean;
}
export default function Board({ canDraw }: BoardProps) {

    return (
        <div className="h-[50vh]">
            {canDraw ? <DrawerBoard /> : <GuesserBoard />}
        </div>
    );
}