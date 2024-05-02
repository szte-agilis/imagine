import {useEffect, useState} from "react";
import CardTransform from "../../data/CardTransform";
import Card from "./Card";
import {BOARD_ASPECT_RATIO} from "../../data/TransformFunctions";

export default function CardViewer(
    {
        targetState,
        stepCount,
        stepDurationMs,
        onInterpolate,
        selection = [],
        onCardSelect
    }:
    {
        targetState: CardTransform[],
        stepCount: number,
        stepDurationMs: number,
        onInterpolate: (from: CardTransform[], to: CardTransform[], progress: number) => CardTransform[]
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
            const interpolatedState: CardTransform[] = onInterpolate(fromState, targetState, progress);

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