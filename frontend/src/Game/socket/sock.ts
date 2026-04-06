import { io } from "socket.io-client";
// connects to the Socket.IO server running on port 3000
export const socket = io(`http://${window.location.hostname}:1339`, {
  autoConnect: false, // We manually connect in 
});