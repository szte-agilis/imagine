import CardViewer from './CardViewer';

export default function GuesserBoard() {
    return (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '4px #4599de solid' }}>
            <span style={{ fontSize: '30px', opacity: '30%', position: 'absolute', padding: '20px', color: 'black', zIndex: 1 }}>Guesser board</span>
            <CardViewer canDraw={false} />
        </div>
    );
}