import { RoomServiceClient, TokenVerifier} from 'livekit-server-sdk';
import type { APIRoute } from 'astro';

// Initialize the RoomServiceClient with environment variables
const roomClient = new RoomServiceClient(
  import.meta.env.LIVEKIT_HTTP_URL,    // e.g., 'https://your-livekit-server.com'
  import.meta.env.LIVEKIT_API_KEY, // Your LiveKit API key
  import.meta.env.LIVEKIT_SECRET   // Your LiveKit secret key
);

const tokenVerifier = new TokenVerifier(
    import.meta.env.LIVEKIT_API_KEY,
    import.meta.env.LIVEKIT_SECRET);

export const POST: APIRoute = async ({ request }) => {
  try {
    // Extract data from the request body
    const { roomName, identity, trackSid, mute } = await request.json();

    // Extract the token from the Authorization header (Bearer <token>)
    const token = request.headers.get('authorization')?.split(' ')[1];

    // Check if token is provided
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify and decode the token
    let decoded;
    try {
        decoded = await tokenVerifier.verify(token);        
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for admin permissions
    // if (!decoded.roomAdmin) {
    //   return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
    //     status: 403,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    // Mute the participant's track
    await roomClient.mutePublishedTrack(roomName, identity, trackSid, mute);

    // Return success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log the error and return a generic failure response
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to mute participant' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}