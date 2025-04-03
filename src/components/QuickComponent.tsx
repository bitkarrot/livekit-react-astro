import {
  VideoConference,
  formatChatMessageLinks,
  ControlBar,
  LiveKitRoom,
  PreJoin,
  RoomAudioRenderer,
} from '@livekit/components-react';

import '@livekit/components-styles';
import './QuickComponent.css'; // Import our custom LiveKit theme
import './default.scss'; // Import the default LiveKit theme
import React, { useState, useCallback } from 'react';
// import CustomAvatar from './CustomAvatar';

export default function QuickComponent(
  props: {
    room_name: string;
  }
) {
  const [token, setToken] = useState<string | undefined>();
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [username, setUsername] = useState('');
  const [initials, setInitials] = useState(props.initials || 'TU');
  const [avatarUrl, setAvatarUrl] = useState(props.avatarUrl || '');

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
    // Set initials based on username if not provided in props
    if (values.username) {
      const nameParts = values.username.split(' ');
      if (nameParts.length >= 2) {
        setInitials((nameParts[0][0] + nameParts[1][0]).toUpperCase());
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        setInitials(nameParts[0].substring(0, 2).toUpperCase());
      }
      console.log('set initials: ', initials)
    }

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
      />

      {/* Add custom avatar for the current user */}
      {/* <CustomAvatar
        participantIdentity={username}
        initials={initials}
        avatarUrl={avatarUrl}
      /> */}

      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  );
}
