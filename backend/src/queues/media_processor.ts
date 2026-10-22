import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../redis';
import { processAndDownloadMedia } from '../services/media';

// Queue for downloading media asynchronously
export const mediaQueue = new Queue('media-queue', { connection: redis });

const mediaWorker = new Worker(
  'media-queue',
  async (job: Job) => {
    console.log(`Processing media job ${job.id}`);
    const { mediaId, messageId } = job.data;
    await processAndDownloadMedia(mediaId, messageId);
  },
  { 
    connection: redis,
  }
);

mediaWorker.on('completed', job => {
  console.log(`Media Job ${job.id} completed`);
});

mediaWorker.on('failed', (job, err) => {
  console.error(`Media Job ${job?.id} failed:`, err);
});
