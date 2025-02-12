import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const expressServer = app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5500', 'http://127.0.0.1:5500'],
  },
});

io.on('connection', (socket) => {
  console.log(`User connected => ${socket.id}`);

  // only emit to connected clients
  socket.emit('message', 'Welcome to the chat app!');

  // upon connection to all others except connected user
  socket.broadcast.emit(
    'message',
    `User ${socket.id.substring(0, 5)} connected!`
  );

  // Listening for message event
  socket.on('message', (message) => {
    console.log(`Received message => ${message}`);
    io.emit('message', `Message ${socket.id.substring(0, 5)}: ${message}`);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit(
      'message',
      `User ${socket.id.substring(0, 5)} disconnected!`
    );
  });

  // Listen for activity
  socket.on('activity', (username) => {
    socket.broadcast.emit('activity', username);
  });
});
