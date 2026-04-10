import { Router, Request, Response } from 'express';
import { messageQueue } from '../queues/bullmq';
import { prisma } from '../db';
import { emitNewMessage } from '../websocket/socket';
import { MessageStatus, MessageType } from '@prisma/client';
import { getMetaTemplates, sendTemplateMessage } from '../services/templates';

export const messagesRouter = Router();

// POST /api/messages/conversation
messagesRouter.post('/conversation', async (req: Request, res: Response) => {
  console.log('Received conversation creation request:', req.body);
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).json({ error: 'Missing phoneNumber' });
      return;
    }

    // Clean phone number (remove +, spaces, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // 1. Upsert Contact
    const contact = await prisma.contact.upsert({
      where: { phone_number: cleanNumber },
      update: {},
      create: { phone_number: cleanNumber }
    });
    console.log('Contact upserted:', contact.id);

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
          last_message_at: new Date(),
          status: 'open'
        }
      });
    }

    res.status(200).json({ 
      id: conversation.id, 
      phone_number: cleanNumber,
      last_message_at: conversation.last_message_at
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/send
messagesRouter.post('/send', async (req: Request, res: Response) => {
  try {
    const { to, message, conversationId } = req.body;

    const cleanTo = to.replace(/\D/g, '');
    
    // 1. Create PENDING message in DB immediately (Optimistic UI)
    const pendingMessage = await prisma.message.create({
      data: {
        conversation_id: conversationId,
        from_me: true,
        message_text: message,
        status: MessageStatus.PENDING,
        timestamp: new Date()
      }
    });

    // 2. Emit via socket instantly so user sees it
    emitNewMessage(pendingMessage);

    // 3. Add to BullMQ for actual delivery, passing the messageId
    const job = await messageQueue.add('sendWhatsApp', {
      to: cleanTo,
      messageText: message,
      conversationId,
      messageId: pendingMessage.id
    });

    res.status(202).json({ success: true, messageId: pendingMessage.id, jobId: job.id });
  } catch (error: any) {
    console.error('Error queuing message:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/conversations
messagesRouter.get('/conversations', async (req: Request, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        contact: true,
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { last_message_at: 'desc' }
    });

    // Format for frontend
    const formatted = conversations.map(c => ({
      id: c.id,
      contact_id: c.contact_id,
      phone_number: c.contact.phone_number,
      name: c.contact.name,
      labels: c.contact.labels,
      last_message: c.messages[0]?.message_text || 'No messages yet',
      last_message_at: c.last_message_at
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/templates
messagesRouter.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await getMetaTemplates();
    res.status(200).json(templates);
  } catch (error: any) {
    console.error('Error fetching templates API:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/templates/send
messagesRouter.post('/templates/send', async (req: Request, res: Response) => {
  try {
    const { to, templateName, language, variables, conversationId } = req.body;
    
    // 1. Send via Meta API immediately (Templates are usually fast/low volume bypass)
    const metaResponse = await sendTemplateMessage(to, templateName, language, variables);
    const wabaId = metaResponse.messages?.[0]?.id;

    // 2. Persist in DB
    const templateMsg = await prisma.message.create({
      data: {
        conversation_id: conversationId,
        from_me: true,
        message_text: `Template: ${templateName}`,
        type: MessageType.TEMPLATE,
        status: MessageStatus.SENT,
        wa_id: wabaId,
        metadata: { templateName, variables }
      }
    });

    // 3. Emit via socket
    emitNewMessage(templateMsg);

    res.status(200).json({ success: true, messageId: templateMsg.id });
  } catch (error: any) {
    console.error('Error sending template API:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics
messagesRouter.get('/analytics', async (req: Request, res: Response) => {
  try {
    const totalSent = await prisma.message.count({ where: { from_me: true } });
    const totalReceived = await prisma.message.count({ where: { from_me: false } });

    const statusCounts = await prisma.message.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    const dailyStats = await prisma.message.groupBy({
      by: ['timestamp'],
      _count: { _all: true },
      where: {
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Formatting daily stats (simplified for demo)
    const formattedDaily = dailyStats.reduce((acc: any, curr) => {
      const date = curr.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + curr._count._all;
      return acc;
    }, {});

    const dailyArray = Object.keys(formattedDaily).map(date => ({
      date,
      count: formattedDaily[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      totalSent,
      totalReceived,
      statusDistribution: statusCounts.map(s => ({ status: s.status, count: s._count._all })),
      dailyVolume: dailyArray
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/conversations/:id/messages
messagesRouter.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await prisma.message.findMany({
      where: { conversation_id: id },
      orderBy: { timestamp: 'asc' }
    });
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
