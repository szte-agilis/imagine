import React, { useState } from "react";
import "./Lobby.css";

export default function App() {
    const [username, setUsername] = useState("");
    const [lobby, setLobby] = useState(0);

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handleLobbyChange = (event) => {
        setLobby(Number(event.target.value));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("lobby", lobby);
        window.location.href = "/gamefield";
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleUsernameChange}
            />
            <input
                type="number"
                id="lobby"
                name="lobby"
                value={lobby}
                onChange={handleLobbyChange}
            />
            <br />
            <button
                type="submit"
                id="create-lobby"
                name="create-lobby"
            >
                Csatlakozas
            </button>
        </form>
    );
}
