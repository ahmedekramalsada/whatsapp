// backend/src/services/media.ts
import { prisma } from '../db';
import fs from 'fs';
import path from 'path';

export async function processAndDownloadMedia(mediaId: string, messageId: string) {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.PHONE_NUMBER_ID;

    // 1. Fetch Media URL from Meta
    const res = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error(`Failed to get media URL for ${mediaId}`);
    
    const mediaData = await res.json();
    const downloadUrl = mediaData.url;

    // 2. Download the actual binary using the url and passing the auth token
    const mediaRes = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!mediaRes.ok) throw new Error('Failed to download media binary');

    const buffer = await mediaRes.arrayBuffer();

    // 3. Save locally (for MVP/Docker)
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    // simplistic extension mapping based on mime_type (in reality, you map mediaData.mime_type)
    let ext = '.bin';
    if (mediaData.mime_type.includes('image/jpeg')) ext = '.jpg';
    if (mediaData.mime_type.includes('image/png')) ext = '.png';
    if (mediaData.mime_type.includes('video/mp4')) ext = '.mp4';
    if (mediaData.mime_type.includes('audio/ogg')) ext = '.ogg';
    
    const filename = `${mediaId}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, Buffer.from(buffer));

    const finalUrl = `/uploads/${filename}`;

    // 4. Update the Message in DB
    await prisma.message.update({
      where: { id: messageId },
      data: { media_url: finalUrl }
    });

    // To-do: emit socket update so frontend UI refreshes with the actual image
    
  } catch (error) {
    console.error(`Error processing media ${mediaId}:`, error);
  }
}
