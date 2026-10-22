import { Server } from 'socket.io';

let globalIo: Server;

export function initializeWebsockets(io: Server) {
  globalIo = io;
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Optional: Frontend can subscribe to a specific conversation
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

/**
 * Broadcasts a new message globally, and also specifically to the conversation room.
 */
export function emitNewMessage(messageData: any) {
  if (!globalIo) return;
  // Global dashboard event (Updates unread counts, moves conversation to top)
  globalIo.emit('new_message_global', messageData);
  
  // Room specific event (Adds to the active chat bubble screen directly)
  globalIo.to(messageData.conversation_id).emit('new_message', messageData);
}
