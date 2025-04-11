import { AccessToken } from 'livekit-server-sdk';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    // Parse JSON body from POST request
    const { roomName, participantName, attributes } = await request.json();

    // Validate required fields
    if (!roomName || !participantName) {
      return new Response(
        JSON.stringify({ error: 'roomName and participantName are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Ensure attributes is an object, fallback to defaults if not provided
    const defaultAttributes: Record<string, string> = {
      petname: participantName,
      moderator: 'false',
      owner: 'false',
    };

    // TODO: set moderator/owner status based on 
    // room ownership on signed 30312 for room name
    // or if this it the first user in an ephemeral room, 
    // they are owner

    // Merge provided attributes with defaults, ensuring all values are strings
    const finalAttributes: Record<string, string> = {
      ...defaultAttributes,
      ...(attributes && typeof attributes === 'object'
        ? Object.fromEntries(
            Object.entries(attributes).map(([key, value]) => [key, String(value)])
          )
        : {}),
    };

    console.log('Final attributes:', finalAttributes);

     // Debug logging    
    if (!roomName || !participantName) {
      return new Response('Room name and participant name are required', { status: 400 });
    }
    
    // Get Livekit API key and secret from environment variables
    const apiKey = import.meta.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY;
    const apiSecret = import.meta.env.LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return new Response('LiveKit API key or secret not configured', { status: 500 });
    }
    // console.log('API key:', apiKey)
    // console.log('API secret:', apiSecret)

    let ttl = '10m'; // time to expire session

    // Create a new access token
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: ttl, // token to expire after 10 minutes
      attributes: finalAttributes
    });
    
    // Grant permissions to the room
    // modify for moderators/owners
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });
    
    const jwt = await token.toJwt();
    // console.log('Generated token:', jwt);

    // Return the token and WebSocket URL
    return new Response(JSON.stringify({
       token: jwt,
       url: process.env.LIVEKIT_WS_URL || 'ws://localhost:7880',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};