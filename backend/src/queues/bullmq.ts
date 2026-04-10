import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../redis';
import { sendWhatsAppMessage } from '../services/whatsapp';

// Queue for sending messages
export const messageQueue = new Queue('message-queue', { connection: redis });

// Worker for sending messages
const messageWorker = new Worker(
  'message-queue',
  async (job: Job) => {
    console.log(`Processing message job ${job.id}`);
    const { to, messageText, conversationId, messageId } = job.data;
    await sendWhatsAppMessage(to, messageText, conversationId, messageId);
  },
  { 
    connection: redis,
    // Add concurrency & rate limit options here if handling massive workloads
  }
);

messageWorker.on('completed', job => {
  console.log(`Job ${job.id} completed successfully`);
});

messageWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
