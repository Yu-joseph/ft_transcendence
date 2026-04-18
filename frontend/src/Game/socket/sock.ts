import { io } from "socket.io-client";

const HOST = window.location.hostname;
const EDGE = "https://" + HOST + ":8443";

export const socket = io(EDGE, {
  autoConnect: false,
  withCredentials: true,
  path: "/game-socket",
});
