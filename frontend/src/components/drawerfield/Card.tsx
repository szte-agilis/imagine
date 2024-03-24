import { CardTransform } from '../../data/CardTransform';
import { CSSProperties, useState } from 'react';
import image from '../../assets/card.png';


export default function Card({
    transform,
   
    id,
}: {
    transform: CardTransform;
   
    id: any;
}) {
    const [isMouseDown, setIsMouseDown] = useState(false);

    let style: CSSProperties = {
        position: 'absolute',
        top: `${transform.position.y}px`,
        left: `${transform.position.x}px`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg)`,
        zIndex: 10,
        userSelect: 'none',
    };

    const handleMouseDown = () => {
        setIsMouseDown(true);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (isMouseDown) {
            const { clientX, clientY } = event;
            transform.position.x = clientX-50;
            transform.position.y = clientY-80;
            setIsMouseDown(false);
        }
    };

    return (
        <div
            id={id}
            draggable={false} // Mivel saját mozgatást használunk, nem kell a DOM által kezelt húzhatóságot bekapcsolni
            style={style}
            onMouseDown={handleMouseDown}
            //onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
        >
            <img alt="card" src={image} style={{ maxHeight: '160px' }} />
        </div>
    );
}
