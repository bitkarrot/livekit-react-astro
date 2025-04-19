import { RoomServiceClient, TokenVerifier} from 'livekit-server-sdk';
import type { APIRoute } from 'astro';

// Get Livekit API key and secret from environment variables
const apiKey = import.meta.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY;
const apiSecret = import.meta.env.LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET;
const livekitHost = import.meta.env.LIVEKIT_HTTP_URL || 'http://localhost:7880';

// Initialize the RoomServiceClient with environment variables
const roomService = new RoomServiceClient(
    livekitHost,
    apiKey,
    apiSecret
);

const tokenVerifier = new TokenVerifier(
    apiKey,
    apiSecret
);

export const POST: APIRoute = async ({ request }) => {
  try {
    // Extract data from the request body
    const { roomName, identity } = await request.json();

    const res = await roomService.getParticipant(roomName, identity);
    // console.log('res', res)
    const trackSid = res.tracks[0].sid;
    const muted = res.tracks[0].muted;
    // console.log('trackSid', trackSid, 'muted', muted)

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
    let modstatus = false;
    try {
        decoded = await tokenVerifier.verify(token);
        // console.log('decoded', decoded)
        console.log('moderator', decoded.attributes?.moderator)
        console.log('owner', decoded.attributes?.owner)
        if (decoded.attributes?.owner === 'true'
        || decoded.attributes?.moderator === 'true'
        ) {
          modstatus = true;
        }
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // if modstatus is true, Mute the participant's track
    let message = 'Muting participant:' + identity;
    if (modstatus) {
        console.log('Muting participant', identity, 'muted status: ', !muted);
        if (!muted === false) {
          message = 'Remote unmuteing participant is not allowed';
          console.log("Remote unmuteing participant is not allowed")
        } else {
          await roomService.mutePublishedTrack(roomName, identity, trackSid, !muted);
        }
    }
    // Return success response
    return new Response(JSON.stringify({ success: true, message: message }), {
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