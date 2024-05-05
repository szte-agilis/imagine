import CardTransform from "../../data/CardTransform";
import Card from "./Card";

export const BOARD_ASPECT_RATIO: number = 16.0 / 9.0;

export default function CardViewer(
    {
        cards,
        selection = [],
        onCardSelect = (_: number) => {}
    }: {
        cards: CardTransform[],
        selection?: number[],
        onCardSelect?: (i: number) => void
    }) {

    return (
        <div className="relative bg-gray-800 overflow-hidden" id="board" style={{aspectRatio: BOARD_ASPECT_RATIO}}>
            {cards.map((transform, index) => {
                return (
                    <Card key={index} transform={transform} isSelected={selection.includes(index)} selectCallback={() => onCardSelect(index)}/>
                );
            })}
        </div>
    );
}