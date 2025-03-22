import { AccessToken } from 'livekit-server-sdk';

export async function GET({ params, request }) {
    const url = new URL(request.url);
    const roomName = url.searchParams.get('roomName');
    const participantName = url.searchParams.get('participantName');

     // Debug logging
    console.log("Full URL:", url);
    console.log("All search params:", Object.fromEntries(url.searchParams));
  
    console.log("Extracted roomName:", roomName);
    console.log("Extracted participantName:", participantName);
    
    if (!roomName || !participantName) {
      return new Response('Room name and participant name are required', { status: 400 });
    }
    
    // Get API key and secret from environment variables
    const apiKey = import.meta.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY;
    const apiSecret = import.meta.env.LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return new Response('LiveKit API key or secret not configured', { status: 500 });
    }
    
    console.log('API key:', apiKey)
    console.log('API secret:', apiSecret)

    // Create a new access token
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '10m',
    });
    
    // Grant permissions to the room
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