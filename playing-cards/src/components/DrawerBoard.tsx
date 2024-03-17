import CardViewer from './CardViewer';

export default function DrawerBoard() {
    return (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <span style={{fontSize: '30px', opacity: '30%', position: 'absolute', padding: '20px', color: 'black', zIndex: 1}}>Drawer board</span>
            <CardViewer canDraw={true} />
        </div>
    );
}