import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties } from 'react';
import { images } from './imageImports';

export default function Card({ transform, selectCallback }: { transform: CardTransform, selectCallback?: MouseEventHandler}) {
    const transformStyle: CSSProperties = {
        top: `${transform.position.y}px`,
        left: `${transform.position.x}px`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg)`,
    };

    return (
        <div className="absolute select-none z-10" style={transformStyle} onClick={selectCallback}>
            <img className="max-h-40 rounded-lg" src={images.at(transform.image)} alt="card"/>
        </div>
    );
}
