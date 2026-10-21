const ChatMessage = require('../models/ChatMessage');

const registerChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.io Client Connected]: ${socket.id}`);

    // Join room for a therapist-client conversation
    socket.on('join_chat', async ({ therapistId, clientId }) => {
      if (!therapistId || !clientId) return;

      const room = `chat_${therapistId}_${clientId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);

      try {
        // Send previous chat history to the newly connected party
        const history = await ChatMessage.find({
          therapist_id: therapistId,
          client_id: clientId,
        })
          .sort({ createdAt: 1 })
          .limit(100);

        socket.emit('chat_history', history);
      } catch (err) {
        console.error('Error fetching chat history:', err.message);
      }
    });

    // Handle sending message
    socket.on('send_message', async ({ therapistId, clientId, senderType, senderName, message }) => {
      if (!therapistId || !clientId || !message) return;

      try {
        const chatMsg = await ChatMessage.create({
          therapist_id: therapistId,
          client_id: clientId,
          sender_type: senderType, // 'therapist' or 'client'
          sender_name: senderName || '',
          message,
          is_read: false,
        });

        const room = `chat_${therapistId}_${clientId}`;
        io.to(room).emit('new_message', chatMsg);
      } catch (err) {
        console.error('Error storing chat message:', err.message);
      }
    });

    // Typing indicators
    socket.on('typing', ({ therapistId, clientId, senderName }) => {
      const room = `chat_${therapistId}_${clientId}`;
      socket.to(room).emit('user_typing', { senderName });
    });

    socket.on('stop_typing', ({ therapistId, clientId }) => {
      const room = `chat_${therapistId}_${clientId}`;
      socket.to(room).emit('user_stop_typing');
    });

    // Read receipts
    socket.on('mark_read', async ({ messageIds, therapistId, clientId }) => {
      try {
        if (messageIds && messageIds.length > 0) {
          await ChatMessage.updateMany(
            { _id: { $in: messageIds } },
            { is_read: true, read_at: new Date() }
          );
        }
        const room = `chat_${therapistId}_${clientId}`;
        socket.to(room).emit('messages_read', { messageIds });
      } catch (err) {
        console.error('Error marking messages as read:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io Client Disconnected]: ${socket.id}`);
    });
  });
};

module.exports = registerChatSocket;
