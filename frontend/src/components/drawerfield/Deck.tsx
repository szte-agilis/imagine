export default function Deck({ onCardSelect, cardIds }: { onCardSelect: (index: number) => void, cardIds: number[] }) {
    return (
        <div className="absolute z-20 bg-opacity-50 bg-slate-950 size-full pt-10 p-4 overflow-auto fancy-scrollbar scrollbar-offset">
            <div className="flex flex-wrap justify-center">
                {cardIds.map((id: number, index: number) => {
                    return (
                        <div key={id} className="w-28 h-44 bg-orange-400 border text-black p-2 m-2 rounded-lg" onClick={() => onCardSelect(id)}>
                            #{id}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}