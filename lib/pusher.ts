// lib/pusher.ts
import PusherClient from 'pusher-js';
import PusherServer from 'pusher';

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!, // This should likely be PUSHER_KEY
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!, // This should likely be PUSHER_CLUSTER
  useTLS: true
});