import { RoomServiceClient } from 'livekit-server-sdk';
import type { APIContext } from 'astro';

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { roomName, participantId } = body;

    if (!roomName || !participantId) {
      return new Response(JSON.stringify({ error: 'Room name and participant ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize the LiveKit Room Service client
    const apiUrl = import.meta.env.LIVEKIT_API_URL || process.env.LIVEKIT_API_URL;
    const apiKey = import.meta.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY;
    const apiSecret = import.meta.env.LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET;

    if (!apiUrl || !apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: 'LiveKit API configuration is incomplete' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const roomService = new RoomServiceClient(apiUrl, apiKey, apiSecret);
    
    // Remove the participant from the room
    await roomService.removeParticipant(roomName, participantId);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    return new Response(JSON.stringify({ error: 'Failed to remove participant' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
