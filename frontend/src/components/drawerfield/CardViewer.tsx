import CardTransform from "../../data/CardTransform";
import Card from "./Card";

export const BOARD_ASPECT_RATIO: number = 16.0 / 9.0;

export default function CardViewer(
    {
        cards,
        groups = [],
        selection = [],
        onCardSelect = (_: number): void => {
        }
    }: {
        cards: CardTransform[],
        groups?: number[][],
        selection?: number[],
        onCardSelect?: (i: number) => void
    }) {

    return (
        <div className="relative overflow-hidden rounded-xl bg-[#252729]" id="board" style={{aspectRatio: BOARD_ASPECT_RATIO}}>
            {cards.map((transform: CardTransform, index: number) =>
                <Card
                    key={index}
                    transform={transform}
                    group={groups.findIndex(subArray => subArray.includes(transform.id)) + 1}
                    isSelected={selection.includes(index)}
                    selectCallback={() => onCardSelect(index)}
                />
            )}
        </div>
    );
}