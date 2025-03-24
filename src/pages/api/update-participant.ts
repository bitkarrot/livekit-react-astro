import type { APIRoute } from 'astro';
import { RoomServiceClient } from 'livekit-server-sdk';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { roomName, identity, metadata } = await request.json();
    
    if (!roomName || !identity || !metadata) {
      return new Response('Missing required parameters', { status: 400 });
    }
    
    // Get API key and secret from environment variables
    const apiKey = import.meta.env.LIVEKIT_API_KEY;
    const apiSecret = import.meta.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return new Response('LiveKit API key or secret not configured', { status: 500 });
    }
    
    // Create a RoomServiceClient to interact with LiveKit server
    const roomService = new RoomServiceClient(
      import.meta.env.LIVEKIT_URL,
      apiKey,
      apiSecret
    );
    
    // Convert metadata to string if it's not already
    const metadataStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
    
    // Update the participant's metadata
    await roomService.updateParticipant(roomName, identity, metadataStr);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating participant metadata:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
