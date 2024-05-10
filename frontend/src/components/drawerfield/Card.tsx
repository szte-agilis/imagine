import CardTransform from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties } from 'react';
import {cardImages} from '../../data/ImageImports';
import  {color,neon_color} from '../../data/CardGrupsColors';

export default function Card({ transform,group=0, isSelected = false, selectCallback }: { transform: CardTransform,group:number, isSelected?: boolean, selectCallback: MouseEventHandler }) {
    let c=color(group);
    let nc=neon_color(group);
    const style: CSSProperties = {
        top: `${transform.position.y}%`,
        left: `${transform.position.x}%`,
        height: '100%',
        transform: `translate(-50%, -50%) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
        boxShadow: isSelected ? `0px 0px ${3 / transform.scale}px ${0.6 / transform.scale}px ${nc}` : 'none',
        backgroundColor:`${c}`,
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
