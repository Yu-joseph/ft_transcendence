import { io, Socket } from "socket.io-client";

const HOST = window.location.hostname;
const EDGE = "https://" + HOST + ":8443";

export const chatSocket: Socket = io(EDGE, {
  autoConnect: false,
  withCredentials: true,
  path: "/socket.io",
});

export const gameSocket: Socket = io(EDGE, {
  autoConnect: false,
  withCredentials: true,
  path: "/game-socket",
});

