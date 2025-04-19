import type { APIRoute } from 'astro';
import { WebhookReceiver, WebhookEvent } from 'livekit-server-sdk';

// Initialize WebhookReceiver with API key and secret from environment variables
const apiKey = import.meta.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY;
const apiSecret = import.meta.env.LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set in environment variables');
}

const receiver = new WebhookReceiver(apiKey, apiSecret);

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate Content-Type
    const contentType = request.headers.get('Content-Type');
    if (contentType !== 'application/webhook+json') {
      return new Response(JSON.stringify({ error: 'Invalid Content-Type' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the raw body and convert to string
    const body = await request.arrayBuffer();
    const text = new TextDecoder().decode(body); // Convert ArrayBuffer to string (UTF-8)
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate and parse the webhook event
    const event: WebhookEvent = await receiver.receive(text, authorization);

    // Handle different webhook events
    switch (event.event) {
      case 'room_started':
        console.log(`Room Started: ${event.room?.name || 'unknown'}`);
        break;
      case 'room_finished':
        console.log(`Room Finished: ${event.room?.name || 'unknown'}`);
        break;
      case 'participant_joined':
        console.log(`Participant Joined: ${event.participant?.identity || 'unknown'} in room ${event.room?.name || 'unknown'}`);
        break;
      case 'participant_left':
        console.log(`Participant Left: ${event.participant?.identity || 'unknown'} from room ${event.room?.name || 'unknown'}`);
        break;
      case 'track_published':
        console.log(`Track Published: ${event.track?.sid || 'unknown'} by ${event.participant?.identity || 'unknown'}`);
        break;
      case 'track_unpublished':
        console.log(`Track Unpublished: ${event.track?.sid || 'unknown'} by ${event.participant?.identity || 'unknown'}`);
        break;
      case 'egress_started':
        console.log(`Egress Started: ${event.egressInfo?.egressId || 'unknown'}`);
        break;
      case 'egress_updated':
        console.log(`Egress Updated: ${event.egressInfo?.egressId || 'unknown'}, status: ${event.egressInfo?.status || 'unknown'}`);
        break;
      case 'egress_ended':
        console.log(`Egress Ended: ${event.egressInfo?.egressId || 'unknown'}`);
        break;
      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    // Return success response
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Invalid webhook payload or authorization' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};