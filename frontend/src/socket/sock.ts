import { io } from "socket.io-client";
<<<<<<< HEAD

export const socket = io("http://localhost:3000", {
  autoConnect: false, // We manually connect in Lobby
=======
// connects to the Socket.IO server running on port 3000
export const socket = io("http://localhost:3000", {
  autoConnect: false, // We manually connect in 
>>>>>>> sayf
});
