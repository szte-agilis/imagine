import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties, MouseEvent, useState } from 'react';
import { images } from './imageImports';
//import { click } from '@testing-library/user-event/dist/click';

export default function Card({ transform, selectCallback }: { transform: CardTransform; selectCallback: MouseEventHandler }) {
    const [selected, setSelected] = useState(false);
    

    let style: CSSProperties = {
        
        top: `${transform.position.y}%`,
        left: `${transform.position.x}%`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg) translate(-50%, -50%)`,
        maxHeight: '25%',
        border: selected ? '2px solid white' : 'none',
        cursor: selected ? 'move': 'auto',
    };

    const Click_kijelol = () => {
      

        if (!selected) {
            setSelected(true);
        } else {
            setSelected(false);
           
        }
    };
    
    

    return (
        <img
            className="z-10 absolute select-none Card"
            style={style}
            draggable={true}
            onMouseDown={Click_kijelol}
            
            src={images.at(transform.image)}
            alt="card"
            
        />
    );
}
