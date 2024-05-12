import './styles/TopicLenghtContainer.css';

const TopicLengthContainer = (props) => {
    const solution = props.solution;

    if (!solution || !solution.solution) {
        return <div></div>;
    } else {
        return (
            <div className="topic-container">
                <div className="preserveWhiteSpaces">
                    {'Téma: ' +
                        solution.topic +
                        ', ' +
                        'Megfejtés: ' +
                        solution.solution
                            .replace(/\s/g, '  ')
                            .replace(/\p{L}/gu, '_ ')}
                </div>
            </div>
        );
    }
};

export default TopicLengthContainer;
