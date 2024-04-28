const TopicLengthContainer = (props) => {
    const solution = props.solution;

    if (solution == null) {
        return <div></div>;
    } else {
        return (
            <div>
                <div>{'Téma: ' + solution.topic}</div>
                <div>{'Megfejtés hossza: ' + solution.solution.length}</div>
            </div>
        );
    }
};

export default TopicLengthContainer;
