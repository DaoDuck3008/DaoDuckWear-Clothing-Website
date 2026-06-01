import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth.store";

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function createSocket(): Socket {
  return io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: { token: useAuthStore.getState().access_token },
  });
}

export function getSocket(): Socket {
  if (!socket) socket = createSocket();
  return socket;
}

// Kết nối (hoặc kết nối lại) với access_token mới nhất
export function connectSocket(): Socket {
  const s = getSocket();
  const token = useAuthStore.getState().access_token;
  s.auth = { token };
  if (token && !s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
