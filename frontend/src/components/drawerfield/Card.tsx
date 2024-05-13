import CardTransform from '../../data/CardTransform';
import {MouseEventHandler, CSSProperties} from 'react';
import {cardImages} from '../../data/ImageImports';

export default function Card({transform, group = 0, isSelected = false, selectCallback}: { transform: CardTransform, group: number, isSelected?: boolean, selectCallback: MouseEventHandler }) {
    const style: CSSProperties = {
        top: `${transform.position.y}%`,
        left: `${transform.position.x}%`,
        height: '100%',
        transform: `translate(-50%, -50%) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
        boxShadow: isSelected ? `0px 0px ${3 / transform.scale}px ${0.6 / transform.scale}px ${cardShadowColor(group)}` : 'none',
        backgroundColor: `${cardBackgroundColors[group]}20`,
        borderRadius: '6%'
    };

    return (
        <img
            className="z-10 absolute select-none"
            style={style}
            onMouseDown={selectCallback}
            src={cardImages.at(transform.id)}
            alt="card"
        />
    );
}

export const cardBackgroundColors: string[] = [
    '#ffffff',
    '#ffea00',
    '#ff0000',
    '#008fff',
    '#1aff00'
];

export function cardShadowColor(groupIndex: number): string {
    return groupIndex > 0 ? "rgba(255, 255, 255, 0.9)" : "rgba(46, 248, 255, 0.9)";
}