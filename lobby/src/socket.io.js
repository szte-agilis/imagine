import io from 'socket.io-client';

export const socket = io('localhost:4000'); // Replace with your server URL

socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
});
