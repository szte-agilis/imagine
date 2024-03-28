import React, { useCallback, useEffect, useState } from 'react';
import io from 'socket.io-client';
import {MyImageComponent} from './Start-Page';
import './Lobby.css';

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

            window.addEventListener('beforeunload', handleBeforeUnload);

            // Remember to clean up the event listener
            return () => {
                socket.off('redirect');
                socket.off('user list');
            };
        }

    }, [socket]);

    const handleBeforeUnload = useCallback((event) => {
        event.preventDefault();
        if (socket) {
            socket.emit('window closed', localLobby, localUsername);
        }
        event.returnValue = '';
    }, [socket, localLobby, localUsername]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        window.removeEventListener('beforeunload', handleBeforeUnload);
        socket.emit('start game clicked', null);
    };

    return (
        <div>
            <MyImageComponent />
            <LobbyCode lobbyCode={localLobby} />
            <UserList users={users} />

            <div className="button-container">
            {lobbyAdmin === localUsername && (
                <button className="btn btn-success" onClick={handleSubmit}>
                    Start Game
                </button>)}
            </div>

        </div>
    );
}

function LobbyCode({ lobbyCode }) {
    return (
        <div className={'lobby-code-container'}>
            <div
                className="lobby-code-text max-w-md p-4">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Lobby kód: {lobbyCode}</h5>
            </div>
        </div>
    );

}

function UserList({ users }) {
    return (
        <div className={'lobby-container'}>
            <div
                className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-bold leading-none text-gray-900 dark:text-white">Játékosok</h5>
                </div>
                <div className="flow-root">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user, index) => (
                            <li className="py-3 sm:py-4">
                                <div className="flex items-center">
                                    <div className="flex-1 min-w-0 ms-4">
                                        <p className="text-base font-medium text-gray-900 truncate dark:text-white"
                                           key={index}>{user}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}