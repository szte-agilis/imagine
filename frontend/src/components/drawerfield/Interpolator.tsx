import {useEffect, useState} from "react";

export default function Interpolator<T>(
    {
        initialState,
        targetState,
        stepCount,
        stepDurationMs,
        interpolatorFunction,
        updateFunction
    }:
    {
        initialState: T,
        targetState: T,
        stepCount: number,
        stepDurationMs: number,
        interpolatorFunction: (from: T, to: T, progress: number) => T
        updateFunction: (newState: T) => void
    }) {

    // the current state of the interpolation
    const [currentState, setCurrentState] = useState(initialState);

    // the starting state of the interpolation
    const [fromState, setFromState] = useState(initialState);

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
            const interpolatedState: T = interpolatorFunction(fromState, targetState, progress);

            // update the state and the step counter
            setCurrentState(interpolatedState);
            setCurrentStep(currentStep + 1);

            // call the update function that will update the state of the parent component
            updateFunction(interpolatedState);
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

    return <></>;
}