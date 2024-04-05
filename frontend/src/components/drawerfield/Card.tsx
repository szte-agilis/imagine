import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties } from 'react';
import { images } from './imageImports';

export default function Card({ transform, selectCallback }: { transform: CardTransform; selectCallback: MouseEventHandler }) {
    let style: CSSProperties = {
        top: `${transform.position.y}%`,
        left: `${transform.position.x}%`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg) translate(-50%, -50%)`,
        maxHeight: '25%'
    };

    return (
        <img
            className="z-10 absolute select-none"
            style={style}
            onMouseDown={selectCallback}
            src={images.at(transform.id)}
            alt="card"
        />
    );
}
