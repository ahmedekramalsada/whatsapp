import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

import { webhookRouter } from './api/webhooks';
import { messagesRouter } from './api/messages';
import { contactsRouter } from './api/contacts';

app.use(express.json());
app.use(cors());

app.use('/api/webhook', webhookRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/contacts', contactsRouter);

export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

import { initializeWebsockets } from './websocket/socket';
initializeWebsockets(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
