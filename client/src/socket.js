import io from 'socket.io-client';

const socket = io(window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://sn-handover-app.azurewebsites.net', 
{
  transports: ['websocket'],  // Use WebSocket as the transport
  withCredentials: true
});

export default socket;