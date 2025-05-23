// QuickComponent.tsx - React component for Astro
import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
  formatChatMessageLinks,
} from '@livekit/components-react';
import VideoConference from '../components/VideoConference';
// import type { VideoCodec } from 'livekit-server-sdk';
import { SettingsMenu } from '~/lib/SettingsMenu';

import '@livekit/components-styles';
import './QuickComponent.css'; // Import our custom LiveKit theme
import React from 'react';
import { PreJoin } from './PreJoin';
const { useState, useCallback } = React;
import { nip19 } from 'nostr-tools';

const SHOW_SETTINGS_MENU = 'true';

export default function QuickComponent(
  props: {
    room_name: string;
    hq?: boolean;
    codec?: string; //  codec?: VideoCodec;
    name?: string;
    pubkey?: string;
    avatar?: string;
    lnaddress?: string;
  }
) {
  const [token, setToken] = useState<string | undefined>();
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [username, setUsername] = useState('');

  const preJoinDefaults = React.useMemo(() => {
    const pubkey = props?.pubkey;
    let npub = '';
    if (!pubkey) {
      npub = nip19.npubEncode(pubkey as string);
    }
    return {
      username: props.name || '',
      avatar: props.avatar || '',
      lnaddress: props.lnaddress || '',
      npub: npub || '',
      videoEnabled: false,
      audioEnabled: false,
    };
  }, []);


  const fetchToken = async (roomName: string, participantName: string, attributes: Record<string, string>) => {
    try {
      const response = await fetch('/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          participantName,
          attributes,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      setToken(data.token);
      //console.log('Token:', data.token)

      let url = import.meta.env.PUBLIC_LIVEKIT_WS_URL || "wss://thehive-g3v6mhu7.livekit.cloud"
      console.log('LiveKit WebSocket URL:', url);
      setServerUrl(url);

      return { data };
    } catch (err) {
      console.error('Error fetching token:', err);
      setError(err as Error);
      return { error: err };
    }
  };

  const handlePreJoinSubmit = useCallback(async (values: {
    username: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    videoDeviceId?: string;
    audioDeviceId?: string;
  }) => {
    console.log("PreJoin values:", values);
    setVideoEnabled(values.videoEnabled);
    setAudioEnabled(values.audioEnabled);
    setUsername(values.username);

    const room = props.room_name ?? 'test_room';

    console.log('in Quick Component handle PreJoin, Room Name:', room);

    let attributes: Record<string, string> = {
      petname: values.username,
    }

    const pubkey = props?.pubkey;
    let npub = '';
    if(pubkey) {
      npub = nip19.npubEncode(pubkey); // convert to npub
    }

    attributes = {
      petname: props?.name || values.username, // Fallback to form username if name is missing
      avatar_url: props?.avatar || '',
      npub: npub || '',
      lightning_address: props?.lnaddress || '', // Use existing if available
    };

    await fetchToken(room, values.username, attributes);
    setIsPreJoinComplete(true);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error(error);
    setError(error);
    alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`);
  }, []);

  const handleOnLeave = useCallback(() => {
    window.location.href = '/exit';
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!token || !serverUrl) {
    return (
      <>
        {!isPreJoinComplete ? (
          <PreJoin
            debug={true}
            onSubmit={handlePreJoinSubmit}
            onError={handleError}
            data-lk-theme="hivetalk"
            defaults={preJoinDefaults}
            style={{ height: '100vh' }}
            persistUserChoices={false}
          />
        ) : (
          <div>Loading...</div>
        )}
      </>
    );
  }

  return (
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          video={videoEnabled}
          audio={audioEnabled}
          onDisconnected={handleOnLeave}
          onError={handleError}
          data-lk-theme="hivetalk"
          style={{ height: '100vh' }}
          connect={true}
        >
            <VideoConference
              token={token}
              chatMessageFormatter={formatChatMessageLinks}
              SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
            />
          <RoomAudioRenderer />
          <ControlBar />
        </LiveKitRoom>
  );
}
