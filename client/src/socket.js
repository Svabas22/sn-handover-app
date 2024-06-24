import io from 'socket.io-client';

const socket = io('https://ho-socket.webpubsub.azure.com', {
  path: '/clients/socketio/hubs/mainhub',
  transports: ['websocket', 'polling'],
  withCredentials: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': '*'
  }
});

export default socket;