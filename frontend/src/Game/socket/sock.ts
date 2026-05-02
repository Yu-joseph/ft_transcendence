import { io } from "socket.io-client";

export const socket = io("/", {
  autoConnect: false,
  withCredentials: true,
  path: "/game-socket",
});
