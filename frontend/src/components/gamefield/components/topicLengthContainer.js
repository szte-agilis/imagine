import './styles/TopicLenghtContainer.css';

const TopicLengthContainer = (props) => {
    const solution = props.solution;

    if (solution == null) {
        return <div></div>;
    } else {
        return (
            <div className="topic-container">
                <div>
                    {'Téma: ' +
                        solution.topic +
                        ', ' +
                        'Megfejtés hossza: ' +
                        solution.solution.length}
                </div>
            </div>
        );
    }
};

export default TopicLengthContainer;
