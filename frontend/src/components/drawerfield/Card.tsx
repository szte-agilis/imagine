import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties, MouseEvent } from 'react';
import { images } from './imageImports';

export default function Card({ transform, selectCallback}: { transform: CardTransform; selectCallback: MouseEventHandler }) {
    let style: CSSProperties = {
        top: `${transform.position.y}%`,
        left: `${transform.position.x}%`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg) translate(-50%, -50%)`,
        maxHeight: '25%',
    };

    const handleClick = (event: MouseEvent) => {
        const { clientX, clientY } = event;
        transform.position.x = clientX;
        transform.position.y = clientY;
    };

    return (
        <img className="z-10 absolute select-none" style={style} draggable={true} onMouseDown={handleClick} src={images.at(transform.image)} alt="card" />
    );
}
