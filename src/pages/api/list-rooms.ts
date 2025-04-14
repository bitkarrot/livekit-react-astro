import { Room, RoomServiceClient } from 'livekit-server-sdk';
import type { APIRoute } from 'astro';

const livekitHost = import.meta.env.LIVEKIT_HTTP_URL || 'http://localhost:7880';

// Usage: curl http://localhost:7880/api/list-rooms

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get Livekit API key and secret from environment variables
    const apiKey = import.meta.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY;
    const apiSecret = import.meta.env.LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return new Response('LiveKit API key or secret not configured', { status: 500 });
    }

    const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
    const roomList: Room[] = await roomService.listRooms();
    let roomListSummary: { name: string; sid: string; createdAt: string; numParticipants: number; }[] = [];

    roomList.forEach((room) => {
       // console.log('existing rooms', room);
        roomListSummary.push({
            name: room.name,
            sid: room.sid,
            createdAt: room.creationTime.toString(),
            numParticipants: room.numParticipants,
        });
    });    

    console.log('roomListSummary', roomListSummary)

    return new Response(JSON.stringify(roomListSummary), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error listing rooms:', error);
    return new Response('Failed to list rooms', { status: 500 });
  }
}  
  