import { io, Socket } from "socket.io-client";

export const chatSocket: Socket = io("/", {
  autoConnect: false,
  withCredentials: true,
  path: "/socket.io",
});

export const gameSocket: Socket = io("/", {
  autoConnect: false,
  withCredentials: true,
  path: "/game-socket",
});

