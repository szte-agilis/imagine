import React, { useState, startTransition } from "react";
import "./Start-page.css";
import { useImage } from 'react-image';

export default function App() {    
    const [data, setData] = useState({
        name: "",
        lobbyID: 0,
    });

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
    function MyImageComponent2() {
        const { src } = useImage({
            srcList: 'https://i.pinimg.com/736x/3e/f0/ee/3ef0ee4a246747e96ab8d7816780eb0b.jpg',
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        sessionStorage.setItem("username", data.name);
        sessionStorage.setItem("lobby", data.lobbyID);
        window.location.href = "/lobby";
    };

    function createLobby() {
        var min = 100000;
        var max = 999999;
        let number = Math.floor(Math.random() * (max - min + 1)) + min;
        // Wrap the state update in startTransition
        startTransition(() => {
            setData({ ...data, lobbyID: String(number) });
        });
    }

    return (
        <main>
               <MyImageComponent2 />
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
                    <button className="btn btn-success" onClick={handleSubmit}>
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
