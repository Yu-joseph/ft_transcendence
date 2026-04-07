import { io, Socket } from "socket.io-client";
// connects to the Socket.IO server running on port 3000

const HOST = window.location.hostname; 

const CHAT_URL = `http://${HOST}:3000`;
const GAME_URL = `http://${HOST}:1339`;


export  const chatSocket: Socket = io(CHAT_URL, {
  autoConnect: false,
});

export const gameSocket: Socket = io(GAME_URL, {
  autoConnect: false, // We manually connect in 
});

