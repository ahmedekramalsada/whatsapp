import { Router, Request, Response } from 'express';
import { handleIncomingMessage } from '../services/whatsapp';
import { prisma } from '../db';
import { MessageStatus } from '@prisma/client';
import { emitNewMessage } from '../websocket/socket';

export const webhookRouter = Router();

// GET /webhook (Webhook Verification for Meta)
webhookRouter.get('/', (req: Request, res: Response) => {
  const verify_token = process.env.VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// POST /webhook (Receive messages from WhatsApp)
webhookRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      
      const statuses = value?.statuses;
      const contacts = value?.contacts;
      const messages = value?.messages;

      // Handle Status Updates (Read Receipts)
      if (statuses && statuses.length > 0) {
        for (const statusUpdate of statuses) {
          const { id: wabaId, status } = statusUpdate;
          
          let newStatus: MessageStatus = MessageStatus.SENT;
          if (status === 'delivered') newStatus = MessageStatus.DELIVERED;
          if (status === 'read') newStatus = MessageStatus.READ;
          if (status === 'failed') newStatus = MessageStatus.FAILED;

          try {
            const updatedMessage = await prisma.message.update({
              where: { wa_id: wabaId },
              data: { status: newStatus }
            });
            emitNewMessage(updatedMessage);
          } catch (e) {
            // Might be a message from another system or old message
            console.warn(`Could not update status for wa_id ${wabaId}:`, e);
          }
        }
      }

      if (contacts && contacts.length > 0 && messages && messages.length > 0) {
        const contact = contacts[0];
        const message = messages[0];

        // Process the incoming message via our service layer
        await handleIncomingMessage({
          phoneNumber: contact.wa_id,
          name: contact.profile.name,
          messageData: message
        });
      }

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(200).send('EVENT_RECEIVED'); // Keep Meta happy
  }
});
