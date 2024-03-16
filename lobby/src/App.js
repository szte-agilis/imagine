import React, { useState, startTransition } from 'react';
import { useImage } from 'react-image';
import './App.css';

function MyImageComponent() {
    const { src } = useImage({
        srcList: 'https://cdn.wallpapersafari.com/69/10/CEokAi.jpg',
    });

    return (
        <div
            className="my-image-container"
            style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: -1,
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        ></div>
    );
}

function App() {
    const [data, setData] = useState({
        name: '',
        lobbyID: '',
    });

    const send = async () => {
      console.log(data)
        try {
          const socket = io();
          socket.emit('join', { lobbyID: data.lobbyID , userName: data.name });
          console.log("sikeres")
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <main>
            <div className="App">
                <header className="App-header">
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Neved"
                            className="input input-bordered w-full max-w-xs"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                        />
                        <br />
                         <input
                            type="text"
                            placeholder="Lobby azonosító"
                            className="input input-bordered w-full max-w-xs"
                            id="name"
                            value={data.lobbyID}
                            onChange={(e) => setData({ ...data, lobbyID: e.target.value })}
                        />
                        <br />
                        <button className="btn btn-success" onClick={() => startTransition(send)}>
                            Belépés!
                        </button>
                        <br />
                        <button class="btn btn-primary">Csatlakozás meglévő lobbyhoz!</button>
                        <br />
                        <button class="btn btn-primary">Hozz létre saját lobbyt!</button>
                    </div>
                </header>
            </div>
            <MyImageComponent />
        </main>
    );
}

export default App;
