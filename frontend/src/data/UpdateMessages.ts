import Vector2 from "./Vector2";
import CardTransform from "./CardTransform";
import {BOARD_ASPECT_RATIO} from "../components/drawerfield/CardViewer";

// represents an intent to update the board
// common base class for all update messages
export abstract class UpdateMessage {
    duration: number;

    protected constructor(duration: number) {
        this.duration = duration;
    }

    abstract apply(cards: CardTransform[], progress: number): CardTransform[];
}

// represents an intent to add a card to the board
export class AddMessage extends UpdateMessage {
    id: number;

    constructor(duration: number, id: number) {
        super(duration);
        this.id = id;
    }

    apply(cards: CardTransform[], _: number): CardTransform[] {
        this.duration = 0;

        const card: CardTransform = new CardTransform(this.id, new Vector2(50, 50));

        return cards.concat(card);
    }
}

// represents an intent to remove a selection of cards
export class RemoveMessage extends UpdateMessage {
    selection: number[];

    constructor(duration: number, selection: number[]) {
        super(duration);
        this.selection = selection;
    }

    apply(cards: CardTransform[], _: number): CardTransform[] {
        this.duration = 0;

        return cards.filter(card => !this.selection.includes(card.id));
    }
}

// represents an intent to rotate a selection of cards
export class RotateMessage extends UpdateMessage {
    selection: number[];
    angle: number;

    constructor(duration: number, selection: number[], angle: number) {
        super(duration);
        this.selection = selection;
        this.angle = angle;
    }

    apply(cards: CardTransform[], progress: number): CardTransform[] {
        // copy the array
        const results: CardTransform[] = cards.slice();

        if (this.selection.length === 0) {
            this.progress(progress);
            return results;
        }

        const angle = this.angle * progress;

        const center: Vector2 = getSelectionCenter(results, this.selection);

        const angleRad: number = angle * Math.PI / 180.0;
        const cosTheta: number = Math.cos(angleRad);
        const sinTheta: number = Math.sin(angleRad);

        this.selection.forEach(i => {
            const card: CardTransform = results[i];

            const posX: number = card.position.x
            const posY: number = card.position.y

            // normalize x coordinate by aspect ratio
            const normalizedX = posX * BOARD_ASPECT_RATIO;
            const normalizedY = posY;

            // calculate normalized pivot
            const normalizedPivotX = center.x * BOARD_ASPECT_RATIO;
            const normalizedPivotY = center.y;

            // translate to origin based on normalized pivot
            const translatedX = normalizedX - normalizedPivotX;
            const translatedY = normalizedY - normalizedPivotY;

            // rotate
            const rotatedX = cosTheta * translatedX - sinTheta * translatedY;
            const rotatedY = sinTheta * translatedX + cosTheta * translatedY;

            // translate back and convert back to percentage coordinates
            const newX = (rotatedX + normalizedPivotX) / BOARD_ASPECT_RATIO; // De-normalize x coordinate
            const newY = rotatedY + normalizedPivotY;

            card.position.x = newX;
            card.position.y = newY;

            card.rotation += angle;
        })

        this.progress(progress);
        return results;
    }

    private progress(progress: number) {
        this.duration *= 1 - progress;
        this.angle *= 1 - progress;
    }
}

// represents an intent to scale a selection of cards
export class ScaleMessage extends UpdateMessage {
    selection: number[];
    scale: number;

    constructor(duration: number, selection: number[], scale: number) {
        super(duration);
        this.selection = selection;
        this.scale = scale;
    }

    apply(cards: CardTransform[], progress: number): CardTransform[] {
        // copy the array
        const results: CardTransform[] = cards.slice();

        if (this.selection.length === 0) {
            this.duration *= 1 - progress;
            return results;
        }

        const scalingFactor: number = this.getScalingFactor(progress, results);
        const center: Vector2 = getSelectionCenter(results, this.selection);

        this.duration *= 1 - progress;
        this.scale /= scalingFactor;

        this.selection.forEach(index => {
            if (index < 0 || index >= results.length) {
                return;
            }

            results[index].scale *= scalingFactor;

            // subtraction of card position and center
            let cardPivotDifference: Vector2 = Vector2.sub(results[index].position, center);

            // card and center difference change
            cardPivotDifference = Vector2.mul(cardPivotDifference, scalingFactor);

            // set card new shifted position
            results[index].position = Vector2.add(center, cardPivotDifference);

        });

        return results;
    }

    private getScalingFactor(progress: number, cards: CardTransform[]): number {
        let scalingFactor: number = this.scale;

        this.selection.forEach(i => {
            if (i < 0 || i >= cards.length) {
                return;
            }

            let scale = cards[i].scale * this.scale;

            scale = Math.min(0.9, Math.max(0.1, scale));

            let actualSize = scale / cards[i].scale;

            if (this.scale < 1) {
                scalingFactor = Math.max(scalingFactor, actualSize);
            } else {
                scalingFactor = Math.min(scalingFactor, actualSize);
            }
        })

        scalingFactor = 1 + (scalingFactor - 1) * progress

        return scalingFactor;
    }
}

// represents an intent to move a selection of cards
export class MoveMessage extends UpdateMessage {
    selection: number[];
    vector: Vector2;

    constructor(duration: number, selection: number[], vector: Vector2) {
        super(duration);
        this.selection = selection;
        this.vector = vector;
    }

    apply(cards: CardTransform[], progress: number): CardTransform[] {
        // calculate the vector of the movement
        const vector = Vector2.mul(this.vector, progress);

        // copy the array
        const results: CardTransform[] = cards.slice();

        // no cards to move
        if (this.selection.length === 0) {
            this.progress(progress);
            return results;
        }

        // modify the position of all selected cards
        this.selection.forEach(i => {
            const position: Vector2 = results[i].position;

            position.x += vector.x;
            position.y += vector.y;
        })

        this.progress(progress);
        return results;
    }

    progress(progress: number) {
        this.duration *= 1 - progress;
        this.vector = Vector2.mul(this.vector, 1 - progress);
    }
}

// represents an intent to reset the board
export class ResetMessage extends UpdateMessage {
    constructor(duration: number) {
        super(duration);
    }

    apply(_: CardTransform[], __: number): CardTransform[] {
        this.duration = 0;
        return [];
    }
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