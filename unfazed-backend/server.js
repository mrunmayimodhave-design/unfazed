require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const registerChatSocket = require('./src/sockets/chatSocket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB Atlas first; halts if connection fails
  await connectDB();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Attach socket handlers
  registerChatSocket(io);

  // Server only starts accepting requests after DB connection is established
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Unfazed Backend Server listening on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📡 Socket.IO server ready for live chat`);
    console.log(`======================================================\n`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('❌ Fatal Server Startup Error: Server startup aborted due to database connection failure.');
  process.exit(1);
});
