import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties } from 'react';
import { images } from './imageImports';

export default function Card({ transform, isSelected = false, selectCallback }: { transform: CardTransform, isSelected?: boolean, selectCallback: MouseEventHandler }) {
    let style: CSSProperties = {
        top: `${transform.position.y}%`,
        left: `${transform.position.x}%`,
        transform: `scale(${transform.scale}) translate(-50%, -50%) rotate(${transform.rotation}deg)`,
        boxShadow: isSelected ? '0px 0px 3px 1px rgba(46,248,255,0.9)' : 'none'
    };

    return (
        <img
            className="z-10 absolute select-none max-h-full"
            style={style}
            onMouseDown={selectCallback}
            src={images.at(transform.id)}
            alt="card"
        />
    );
}
