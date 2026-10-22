const path = require('path');
// Load .env from backend directory or project root if running locally
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
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

  // Initialize Socket.io (supports unified full-stack same origin and external frontends)
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // In unified deployment, origin is same-host or allowed development hosts
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Attach socket handlers
  registerChatSocket(io);

  // Server listens on process.env.PORT and 0.0.0.0 for Render production container routing
  const HOST = '0.0.0.0';
  server.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Unfazed Full-Stack Web Service listening on port ${PORT} (host: ${HOST})`);
    console.log(`🌐 Health check: http://${HOST}:${PORT}/api/health`);
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
