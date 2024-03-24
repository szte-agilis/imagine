import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties } from 'react';
import image from '../../assets/card.png';
import { images } from './imageImports';

export default function Card({
    transform,
    selectCallback,
    id,
}: {
    transform: CardTransform;
    selectCallback: MouseEventHandler;
    id: any;
}) {
    let style: CSSProperties = {
        position: 'absolute',
        top: `${transform.position.y}px`,
        left: `${transform.position.x}px`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg)`,
        zIndex: 10,
        userSelect: 'none',
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const { clientX, clientY } = event;
        transform.position.x = clientX;
        transform.position.y = clientY;
    };

    return (
        <div id={id} draggable={true} style={style} onMouseDown={handleClick}>
            <img alt="card" src={image} style={{ maxHeight: '160px' }} />
        </div>
    );
}
