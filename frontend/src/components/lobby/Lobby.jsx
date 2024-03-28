import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function Lobby() {
    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(sessionStorage.getItem('username'));
    const [localLobby, setLocalLobby] = useState(sessionStorage.getItem('lobby'));
    const [lobbyAdmin, setLobbyAdmin] = useState(null);
    const [users, setUsers] = useState([]);

    if(localLobby === null || localUsername === null) {
        window.location.href = '/';
    }

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);
        newSocket.emit('create lobby', localLobby, localUsername);

        newSocket.on('random lobby code', (randomLobby) => {
            setLocalLobby(randomLobby);
            sessionStorage.setItem('lobby', randomLobby);
        });

        return () => newSocket.close();
    }, [localLobby, localUsername]);

    useEffect(() => {
        if (socket) {
            socket.on('user list', (usernames) => {
                setUsers(usernames);
                setLobbyAdmin(usernames[0]);
            });

            socket.on('redirect', () => {
                window.location.href = '/gamefield';

                // a new socket is created in the Gamefield component
                socket.close();
            });

            // Remember to clean up the event listener
            return () => {
                socket.off('redirect');
                socket.off('user list');
            };
        }

    }, [socket]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        socket.emit('start game clicked', null);
    };

    return (
        <div>
            <div id="user-list" style={{ marginTop: '20px' }}>
                {users.map((user, index) => (
                    <div key={index}>{user}</div>
                ))}
            </div>
            <div id="lobby-id" style={{ marginTop: '20px' }}>Lobby kód: {localLobby}</div>
            {lobbyAdmin === localUsername && (
            <button className="btn btn-success" onClick={handleSubmit}>
                Start Game
            </button>)}
        </div>
    );
}