
import { io } from 'socket.io-client'

let socket = null

export const connectSocket = () => {
  if (socket?.connected) return socket

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }

  socket.connect()
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}
