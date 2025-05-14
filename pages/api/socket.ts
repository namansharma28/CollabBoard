import { NextApiRequest } from 'next';
import { initSocketServer, NextApiResponseWithSocket } from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  // Initialize socket server if it's not already initialized
  const io = initSocketServer(req, res);
  
  res.status(200).json({ message: 'Socket server running' });
} 