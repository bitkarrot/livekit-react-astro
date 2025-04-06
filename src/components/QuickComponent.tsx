import {
  //  VideoConference,
  ControlBar,
  LiveKitRoom,
  PreJoin,
  RoomAudioRenderer,
  formatChatMessageLinks,
  // GridLayout,
  // ParticipantTile,
  // useTracks,
  // RoomContext,
} from '@livekit/components-react';
import VideoConference from '../components/VideoConference';
// import type {
//   Track,
//   RoomOptions,
//   VideoCodec,
//   VideoPresets,
//   Room,
//   DeviceUnsupportedError,
//   RoomConnectOptions,
//  } from 'livekit-client'
import type { ConnectionDetails } from '~/lib/types';
import { SettingsMenu } from '~/lib/SettingsMenu';
import type { LocalUserChoices } from '@livekit/components-react';

import '@livekit/components-styles';
import './QuickComponent.css'; // Import our custom LiveKit theme
import './default.scss'; // Import the default LiveKit theme
import React, { useState, useCallback } from 'react';

const SHOW_SETTINGS_MENU = 'true';

export default function QuickComponent(
  props: {
    room_name: string;
    // hq?: boolean;
    // codec?: VideoCodec;
  }
) {
  const [token, setToken] = useState<string | undefined>();
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [username, setUsername] = useState('');

  const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices | undefined>(
    undefined,
  );
  const preJoinDefaults = React.useMemo(() => {
    return {
      username: '',
      videoEnabled: true,
      audioEnabled: true,
    };
  }, []);
  // const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails | undefined>(
  //   undefined,
  // );

  const fetchToken = async (roomName: string, participantName: string) => {
    try {
      const response = await fetch(`/api/get-token?roomName=${roomName}&participantName=${participantName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
      }
      // TODO: get username and avatar image and other metadata from relay and token server
      const data = await response.json();
      setToken(data.token);
      // Hardcoded for now to avoid env issues
      setServerUrl('ws://127.0.0.1:7880');
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

    console.log('in Quick Component, Room Name:', room);

    await fetchToken(room, values.username);
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
            onSubmit={handlePreJoinSubmit}
            onError={handleError}
            defaults={{
              username: 'test_user',
              videoEnabled: true,
              audioEnabled: true,
            }}
            data-lk-theme="hivetalk"
            style={{ height: '100vh' }}
          />
        ) : (
          <div>Loading...</div>
        )}
      </>
    );
  }

  return (
    <LiveKitRoom
      video={videoEnabled}
      audio={audioEnabled}
      token={token}
      serverUrl={serverUrl}
      onDisconnected={handleOnLeave}
      onError={handleError}
      data-lk-theme="hivetalk"
      style={{ height: '100vh' }}
      connect={true}
    >
      <VideoConference
        chatMessageFormatter={formatChatMessageLinks}
        SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
      />

      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  );
}
