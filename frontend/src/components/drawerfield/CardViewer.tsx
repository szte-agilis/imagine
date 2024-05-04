import {useEffect, useState} from "react";
import CardTransform from "../../data/CardTransform";
import Card from "./Card";
import Vector2 from "../../data/Vector2";

export const BOARD_ASPECT_RATIO: number = 16.0 / 9.0;

export default function CardViewer(
    {
        targetState,
        stepCount,
        stepDurationMs,
        selection = [],
        onCardSelect
    }:
    {
        targetState: CardTransform[],
        stepCount: number,
        stepDurationMs: number,
        selection?: number[],
        onCardSelect?: (i: number) => void
    }) {

    // the current state of the interpolation
    const [currentState, setCurrentState] = useState(targetState);

    // the starting state of the interpolation
    const [fromState, setFromState] = useState(targetState);

    // the current interpolation step
    const [currentStep, setCurrentStep] = useState(-10);

    useEffect(() => {
        // create a timer for the interpolation updates
        const id = setInterval(() => {
            // if the target state is reached, do nothing
            if (currentStep > stepCount) {
                return;
            }

            // calculate the progress of the interpolation, between 0 and 1
            const progress: number = currentStep / stepCount;

            // calculate the new state
            const interpolatedState: CardTransform[] = interpolateCardArray(fromState, targetState, progress);

            // update the state and the step counter
            setCurrentState(interpolatedState);
            setCurrentStep(currentStep + 1);
        }, stepDurationMs);

        // clear the timer when the component is unmounted
        return () => {
            clearInterval(id);
        }
    });

    // when the state changes, start interpolation from the start again
    useEffect(() => {
        if(currentStep < 0) {
            setCurrentStep(stepCount + 1);
            return;
        }

        setCurrentStep(1);
        setFromState(currentState);
    }, [targetState]);

    return (
        <div className="relative bg-gray-800 overflow-hidden" id="board" style={{aspectRatio: BOARD_ASPECT_RATIO}}>
            {currentState.map((transform, index) => {
                return (
                    <Card key={index} transform={transform} isSelected={selection.includes(index)} selectCallback={() => onCardSelect === undefined ? undefined : onCardSelect(index)}/>
                );
            })}
        </div>
    );
}

// interpolate an array of cards
function interpolateCardArray(from: CardTransform[], to: CardTransform[], progress: number): CardTransform[] {
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