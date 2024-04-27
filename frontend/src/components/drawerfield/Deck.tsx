import { cardImages } from './ImageImports';
import {CSSProperties} from "react";

export default function Deck({ onCardSelect, cardIds }: { onCardSelect: (index: number) => void, cardIds: number[] }) {
    const cardStyle: CSSProperties = {
        backgroundColor: '#ffffff20',
        borderRadius: '6%'
    };

    return (
        <div className="absolute z-20 bg-opacity-50 bg-slate-950 size-full pt-10 p-4 overflow-auto fancy-scrollbar scrollbar-offset">
            <div className="flex flex-wrap justify-center">
                {cardIds.map((id: number) => {
                    return (
                        <div key={id} className="m-2" style={cardStyle} onClick={() => onCardSelect(id)}>
                            <img className="max-h-40" src={cardImages.at(id)} alt="card" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}