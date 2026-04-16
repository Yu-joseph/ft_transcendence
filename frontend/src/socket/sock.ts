import { io, Socket } from "socket.io-client";
// connects to the Socket.IO server running on port 3000

const HOST = window.location.hostname; 

const CHAT_URL = `https://${HOST}:8443`;
const GAME_URL = `http://${HOST}:1339`;


export  const chatSocket: Socket = io(CHAT_URL, {
  autoConnect: false,
  withCredentials: true
});

export const gameSocket: Socket = io(GAME_URL, {
  autoConnect: false, // We manually connect in 
  withCredentials: true,
});

