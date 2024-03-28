import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function Lobby() {
    const [socket, setSocket] = useState(null);
    const [localUsername, setLocalUsername] = useState(sessionStorage.getItem('username'));
    const [localLobby, setLocalLobby] = useState(sessionStorage.getItem('lobby'));
    const [lobbyAdmin, setLobbyAdmin] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);
        newSocket.emit('join lobby', localLobby, localUsername);

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
        }

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            if (socket) {
                socket.emit('window closed', localLobby);
            }
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            if (socket) {
                socket.off('user list');
            }
        };
    }, [socket]);

    return (
        <div>
            <div id="user-list" style={{ marginTop: '20px' }}>
                {users.map((user, index) => (
                    <div key={index}>{user}</div>
                ))}
            </div>
            <div id="lobby-id" style={{ marginTop: '20px' }}>Lobby kód: {localLobby}</div>
            {lobbyAdmin === localUsername && <SubmitButton />}
        </div>
    );
}

function SubmitButton() {
    const handleSubmit = async (event) => {
        event.preventDefault();
        window.location.href = '/gamefield';
    };

    return (
        <button className="btn btn-success" onClick={handleSubmit}>
            Start Game
        </button>
    );
}