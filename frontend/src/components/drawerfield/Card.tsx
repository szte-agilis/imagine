import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties, MouseEvent } from 'react';
import { images } from './imageImports';

export default function Card({ transform, selectCallback}: { transform: CardTransform; selectCallback: MouseEventHandler }) {
    let style: CSSProperties = {
        position: 'absolute',
        top: `${transform.position.y}px`,
        left: `${transform.position.x}px`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg)`,
        zIndex: 10,
        userSelect: 'none',
    };

    const handleClick = (event: MouseEvent) => {
        const { clientX, clientY } = event;
        transform.position.x = clientX;
        transform.position.y = clientY;
    };

    return (
        <div draggable={true} style={style} onMouseDown={handleClick}>
            <img alt="card" src={images.at(transform.image)} style={{ maxHeight: '160px' }} />
        </div>
    );
}
