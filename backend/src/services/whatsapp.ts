import { prisma } from '../db';
import { emitNewMessage } from './../websocket/socket';
import { mediaQueue } from './../queues/media_processor';
import { MessageStatus, MessageType } from '@prisma/client';

interface IncomingMessagePayload {
  phoneNumber: string;
  name?: string;
  messageData: any;
}

export async function handleIncomingMessage(payload: IncomingMessagePayload) {
  const { phoneNumber, name, messageData } = payload;
  const timestamp = new Date(parseInt(messageData.timestamp) * 1000);

  // 1. Upsert Contact
  const contact = await prisma.contact.upsert({
    where: { phone_number: phoneNumber },
    update: { name: name || undefined },
    create: { phone_number: phoneNumber, name: name }
  });

  // 2. Find or Create Open Conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      contact_id: contact.id,
      status: 'open'
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        contact_id: contact.id,
        last_message_at: timestamp,
        status: 'open'
      }
    });
  } else {
    // Update last_message_at for 24-hr rule
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { last_message_at: timestamp }
    });
  }

  // 3. Persist Message
  let messageText = null;
  let mediaUrl = null;

  if (messageData.type === 'text') {
    messageText = messageData.text.body;
  } else if (messageData.type === 'image' || messageData.type === 'document' || messageData.type === 'audio') {
    mediaUrl = `pending_media:${messageData[messageData.type].id}`;
    if (messageData[messageData.type].caption) {
      messageText = messageData[messageData.type].caption;
    }
  }

  const message = await prisma.message.create({
    data: {
      conversation_id: conversation.id,
      wa_id: messageData.id, // Store Meta ID
      from_me: false,
      message_text: messageText,
      media_url: mediaUrl,
      timestamp: timestamp,
      type: messageData.type === 'image' ? MessageType.IMAGE : 
            messageData.type === 'audio' ? MessageType.AUDIO :
            messageData.type === 'document' ? MessageType.DOCUMENT : MessageType.TEXT,
      status: MessageStatus.DELIVERED
    }
  });

  // Emit socket.io event
  emitNewMessage(message);
  
  // Dispatch media download job if mediaUrl is pending
  if (mediaUrl && mediaUrl.startsWith('pending_media:')) {
    const mediaId = mediaUrl.split(':')[1];
    await mediaQueue.add('download-media', {
      mediaId,
      messageId: message.id
    });
  }
}

export async function sendWhatsAppMessage(to: string, messageText: string, conversationId: string, messageId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
     await prisma.message.update({
       where: { id: messageId },
       data: { status: 'failed' }
     });
     throw new Error('Conversation not found');
  }

  // Verify 24-hour rule
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (conversation.last_message_at < twentyFourHoursAgo) {
    const failedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { status: 'failed' }
    });
    emitNewMessage(failedMessage); // Critical: Tell UI it failed
    console.warn(`[24h Rule Violation] Cannot send message to ${to}`);
    throw new Error('Cannot send free-form message. 24-hour window closed.');
  }

  // Send request via Meta Graph API
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.PHONE_NUMBER_ID;

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: {
          preview_url: false,
          body: messageText
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Meta API Error Detail]:', JSON.stringify(errorData));
      
      const failedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { status: MessageStatus.FAILED }
      });
      emitNewMessage(failedMessage); // Tell UI it failed
      throw new Error(`Meta API Error: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    const wabaId = responseData.messages?.[0]?.id;

    // UPDATE status to 'SENT' and store WABA ID
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { 
        status: MessageStatus.SENT,
        wa_id: wabaId
      }
    });

    // Emit socket.io event to notify about status change
    emitNewMessage(updatedMessage);
  } catch (error: any) {
    console.error(`[Worker Exception] Failed to process message ${messageId}:`, error.message);
    const failedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { status: MessageStatus.FAILED }
    });
    emitNewMessage(failedMessage);
    throw error;
  }
}
