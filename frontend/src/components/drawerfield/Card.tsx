import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler, CSSProperties } from 'react';
import image from '../../assets/card.png';

export default function Card({
    transform,
    selectCallback,
}: {
    transform: CardTransform;
    selectCallback: MouseEventHandler;
}) {
    const style: CSSProperties = {
        position: `absolute` as `absolute`,
        top: `${transform.position.y}px`,
        left: `${transform.position.x}px`,
        transform: `scale(${transform.scale}) rotate(${transform.rotation}deg)`,
        zIndex: 10,
        userSelect: 'none',
    };

    return (
        <div draggable={true} style={style} onMouseDown={selectCallback}>
            <img alt="card" src={image} style={{ maxHeight: '160px' }} />
        </div>
    );
}
