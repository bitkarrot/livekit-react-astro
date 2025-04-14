import { RoomServiceClient } from 'livekit-server-sdk';
import type { APIRoute } from 'astro';

const livekitHost = import.meta.env.LIVEKIT_HTTP_URL || 'http://localhost:7880';

// Usage: curl http://localhost:7880/api/list-users?roomName=room_name

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const roomName = url.searchParams.get('roomName');

  if (!roomName) {
    return new Response('Room name is required', { status: 400 });
  }

  try {
    // Get Livekit API key and secret from environment variables
    const apiKey = import.meta.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY;
    const apiSecret = import.meta.env.LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return new Response('LiveKit API key or secret not configured', { status: 500 });
    }

    const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
    const participantList = await roomService.listParticipants(roomName);
    let listSummary: { identity: string; owner: string; moderator: string; petname: string }[] = [];
    //console.log('participantList', participantList)

    participantList.forEach((participant) => {
        listSummary.push({
            identity: participant?.identity,
            petname: participant?.attributes?.petname,
            owner: participant?.attributes?.owner,
            moderator: participant?.attributes?.moderator,
        });
    });

    return new Response(JSON.stringify(listSummary), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error listing participants:', error);
    return new Response('Failed to list participants', { status: 500 });
  }
};
