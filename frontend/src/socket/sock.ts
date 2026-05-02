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

export function ensureSocketConnected(socket: Socket) {
  const engineState = (socket.io.engine as any)?.readyState; // "opening" | "open" | ...
  if (socket.connected) return;
  if (engineState === "opening" || engineState === "open") return;
  socket.connect();
}

