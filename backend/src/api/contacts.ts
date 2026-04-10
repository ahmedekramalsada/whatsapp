import { Router, Request, Response } from 'express';
import { prisma } from '../db';

export const contactsRouter = Router();

// GET /api/contacts
contactsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    const contacts = await prisma.contact.findMany({
      where: q ? {
        OR: [
          { phone_number: { contains: String(q), mode: 'insensitive' } },
          { name: { contains: String(q), mode: 'insensitive' } },
          { labels: { has: String(q) } }
        ]
      } : {},
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(contacts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/contacts/:id
contactsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        conversations: {
          include: {
            messages: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.status(200).json(contact);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/contacts/:id
contactsRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, labels, notes } = req.body;

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        labels: labels !== undefined ? labels : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });

    res.status(200).json(contact);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
