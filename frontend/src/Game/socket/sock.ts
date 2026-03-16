<<<<<<< HEAD
import { io } from "socket.io-client";
// connects to the Socket.IO server running on port 3000
export const socket = io(`http://${window.location.hostname}:1339`, {
  autoConnect: false, // We manually connect in 
});
=======
import { io, Socket } from "socket.io-client";
// connects to the Socket.IO server running on port 3000
<<<<<<<< HEAD:frontend/src/socket/sock.ts

const HOST = window.location.hostname; 

const CHAT_URL = `http://${HOST}:3000`;
const GAME_URL = `http://${HOST}:1339`;


export  const chatSocket: Socket = io(CHAT_URL, {
  autoConnect: false,
});

export const gameSocket: Socket = io(GAME_URL, {
========
export const socket = io(`http://${window.location.hostname}:3000`, {
>>>>>>>> 2d98fb0 (SA):frontend/src/Game/socket/sock.ts
  autoConnect: false, // We manually connect in 
});

>>>>>>> 2d98fb0 (SA)
