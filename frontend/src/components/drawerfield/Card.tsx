import CardTransform from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties } from 'react';
import {cardImages} from '../../data/ImageImports';
import  CardGroups from '../../data/CardGrups';

export default function Card({ transform,group, isSelected = false, selectCallback }: { transform: CardTransform,group:CardGroups, isSelected?: boolean, selectCallback: MouseEventHandler }) {
    const style: CSSProperties = {
        top: `${transform.position.y}%`,
        left: `${transform.position.x}%`,
        height: '100%',
        transform: `translate(-50%, -50%) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
        boxShadow: isSelected ? `0px 0px ${3 / transform.scale}px ${0.6 / transform.scale}px ${group.neon_color}` : 'none',
        backgroundColor:`${group.color}`,
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
