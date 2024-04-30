import Card from './Card';
import CardTransform from '../../data/CardTransform';
import Vector2 from '../../data/Vector2';

const ASPECT_RATIO: number = 16.0 / 9.0;

export default function CardViewer(
    {
        cards,
        selection = [],
        onCardSelect
    }: {
        cards: CardTransform[],
        selection?: number[],
        onCardSelect?: (i: number) => void
    }) {
    return (
        <div className="relative bg-gray-800 overflow-hidden" style={{aspectRatio: ASPECT_RATIO}}>
            {cards.map((transform, index) => {
                return (
                    <Card key={index} transform={transform} isSelected={selection.includes(index)} selectCallback={() => onCardSelect === undefined ? undefined : onCardSelect(index)}/>
                );
            })}
        </div>
    );
}

// rotate the selected cards
export function rotateSelection(cards: CardTransform[], selection: number[], angleDeg: number) {
    if (selection.length === 0) {
        return;
    }

    const center: Vector2 = getSelectionCenter(cards, selection);

    const angleRad: number = angleDeg * Math.PI / 180.0;
    const cosTheta: number = Math.cos(angleRad);
    const sinTheta: number = Math.sin(angleRad);

    selection.forEach(i => {
        const card: CardTransform = cards[i];
        const posX: number = card.position.x
        const posY: number = card.position.y

        // normalize x coordinate by aspect ratio
        const normalizedX = posX * ASPECT_RATIO;
        const normalizedY = posY;

        // calculate normalized pivot
        const normalizedPivotX = center.x * ASPECT_RATIO;
        const normalizedPivotY = center.y;

        // translate to origin based on normalized pivot
        const translatedX = normalizedX - normalizedPivotX;
        const translatedY = normalizedY - normalizedPivotY;

        // rotate
        const rotatedX = cosTheta * translatedX - sinTheta * translatedY;
        const rotatedY = sinTheta * translatedX + cosTheta * translatedY;

        // translate back and convert back to percentage coordinates
        const newX = (rotatedX + normalizedPivotX) / ASPECT_RATIO; // De-normalize x coordinate
        const newY = rotatedY + normalizedPivotY;

        card.position.x = newX;
        card.position.y = newY;

        card.rotation = cards[i].rotation + angleDeg;
    })
}

// resize the selected cards
export function scaleSelection(cards: CardTransform[], selection: number[], size: number) {
    if (selection.length === 0) {
        return;
    }

    let scalingFactor: number = size;

    selection.forEach(i => {
        if (i < 0 || i >= cards.length) {
            return;
        }

        let scale = cards[i].scale * size;

        scale = Math.min(0.9, Math.max(0.1, scale));


        let actualSize = scale / cards[i].scale;

        if (size < 1) {
            scalingFactor = Math.max(scalingFactor, actualSize);
        } else {
            scalingFactor = Math.min(scalingFactor, actualSize);
        }

    })

    const pivotPos: Vector2 = getSelectionCenter(cards, selection);

    selection.forEach(index => {
        if (index < 0 || index >= cards.length) {
            return;
        }

        cards[index].scale *= scalingFactor;

        // subtraction of card position and center
        let cardPivotDifference: Vector2 = Vector2.sub(cards[index].position, pivotPos);

        // card and center difference change
        cardPivotDifference = Vector2.mul(cardPivotDifference, scalingFactor);

        // set card new shifted position
        cards[index].position = Vector2.add(pivotPos, cardPivotDifference);

    });
}

// move the selected cards
export function moveSelection(cards: CardTransform[], selection: number[], vector: Vector2, boardSize: Vector2) {
    // no cards to move
    if (selection.length === 0) {
        return;
    }

    // modify the position of all selected cards
    selection.forEach(i => {
        const position: Vector2 = cards[i].position;

        position.x += vector.x / boardSize.x * 100;
        position.y += vector.y / boardSize.y * 100;
    })
}

// interpolate an array of cards
export function interpolateCardArray(from: CardTransform[], to: CardTransform[], progress: number): CardTransform[] {
    return to.map(toCard => {
        const index = from.findIndex(card => card.id === toCard.id);

        if(index === -1) {
            return toCard;
        }

        const fromCard = from[index];

        const x = fromCard.position.x + (toCard.position.x - fromCard.position.x) * progress;
        const y = fromCard.position.y + (toCard.position.y - fromCard.position.y) * progress;
        const rotation = fromCard.rotation + (toCard.rotation - fromCard.rotation) * progress;
        const scale = fromCard.scale + (toCard.scale - fromCard.scale) * progress;

        return new CardTransform(fromCard.id, new Vector2(x, y), rotation, scale);
    });
}

// get the center of a card selection
function getSelectionCenter(cards: CardTransform[], selection: number[]): Vector2 {
    const selectedCards: CardTransform[] = selection.map(index => cards[index]);

    const posX: number[] = selectedCards.map(a => a.position.x)
    const posY: number[] = selectedCards.map(b => b.position.y)

    const minX: number = Math.min(...posX);
    const minY: number = Math.min(...posY);
    const maxX: number = Math.max(...posX);
    const maxY: number = Math.max(...posY);

    return new Vector2((minX + maxX) / 2, (minY + maxY) / 2);
}