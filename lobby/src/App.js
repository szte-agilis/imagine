import React, { useState, useEffect } from 'react';
import { useImage } from 'react-image';
import './App.css';
import {socket} from './socket.io'

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
    const [error, setError] = useState(false);

    useEffect(() => {
        let timer;
        if (error) {
            timer = setTimeout(() => {
                setError(false);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [error]);

    const send = async () => {
        console.log('send')
        console.log(data);
        try {
            if (data.lobbyID.length === 6 && data.name.length > 0) {
                await socket.emit('join', {
                    lobbyID: data.lobbyID,
                    userName: data.name,
                });
                console.log('sikeres');
            } else {
                setError(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    function createLobby() {
        var min = 100000;
        var max = 999999;
        let number = Math.floor(Math.random() * (max - min + 1)) + min;
        setData({ ...data, lobbyID: String(number) });
    }

    return (
        <main>
           {error && (
                <div role="alert" className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Üres a név vagy nem 6 számjegyű a lobbyID.</span>
                </div>
            )}
            <div className="App">

                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Neved"
                            className="input input-bordered w-full max-w-xs"
                            id="name"
                            value={data.name}
                            onChange={(e) =>
                                setData({ ...data, name: e.target.value })
                            }
                        />
                        <br />
                        <input
                            type="text"
                            placeholder="Lobby azonosító"
                            className="input input-bordered w-full max-w-xs"
                            id="name"
                            value={data.lobbyID}
                            onChange={(e) =>
                                setData({ ...data, lobbyID: e.target.value })
                            }
                        />
                        <br />
                        <button
                            className="btn btn-success"
                            onClick={send}
                        >
                            Belépés!
                        </button>
                        <br />
                        <button className="btn btn-primary" onClick={createLobby}>
                            Hozz létre saját lobbyt!
                        </button>
                    </div>


            </div>

            <MyImageComponent />
        </main>
    );
}

export default App;
