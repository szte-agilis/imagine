import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties } from 'react';

export default function Card({ transform, selectCallback }: { transform: CardTransform, selectCallback?: MouseEventHandler}) {
    const transformStyle: CSSProperties = {
        top: `${transform.position.y}px`,
        left: `${transform.position.x}px`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg)`,
    };

    return (
        <div className="absolute select-none z-10" style={transformStyle} onClick={selectCallback}>
            {/* TODO image placeholder */}
            <div className="bg-gray-600 px-12 py-20 border-black border-2">
                <span className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-gray-200">
                    #{transform.image}
                </span>
            </div>
        </div>
    );
}
