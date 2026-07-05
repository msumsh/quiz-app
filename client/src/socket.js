import { io } from "socket.io-client";

// One shared connection for the whole app instead of opening a new socket
// on every page — pages just import { socket } and attach/detach listeners.
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export const socket = io(SERVER_URL, {
  autoConnect: true,
});
