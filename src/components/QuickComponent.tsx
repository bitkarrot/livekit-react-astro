import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
  PreJoin,
  GridLayout,
  ParticipantTile,
  useTracks,
  useParticipantTile,
  TrackLoop,
  TrackRefContext,
  // formatChatMessageLinks,
  // Chat,
} from '@livekit/components-react';

import '@livekit/components-styles';
import React, { useState, useEffect } from 'react';

import {
  Track,
  LogLevel,
  type VideoCodec,
  type RoomConnectOptions,
} from 'livekit-client';

// import { DebugMode } from '~/lib/Debug';
// import { SettingsMenu } from '~/lib/SettingsMenu';
import { useMemo } from 'react';

export default function Page() {
  const [token, setToken] = useState<string | undefined>();
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false); // Add state for PreJoin completion
  const [videoEnabled, setVideoEnabled] = useState(true); // Add state for video
  const [audioEnabled, setAudioEnabled] = useState(true); // Add state for audio

  const fetchToken = async (roomName: string, participantName: string) => {
    try {
      const response = await fetch(`/api/get-token?roomName=${roomName}&participantName=${participantName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setToken(data.token);
      setServerUrl(data.url);
    } catch (err) {
      console.error('Error fetching token:', err);
      setError(err.message);
    }
  };

  const handlePreJoinSubmit = async (values: {
    username: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    videoDeviceId: string;
    audioDeviceId: string;
  }) => {
    setVideoEnabled(values.videoEnabled); // Store video selection
    setAudioEnabled(values.audioEnabled); // Store audio selection
    console.log('PreJoin values:', values);
    await fetchToken('test_room', values.username); // Call fetchToken with the username
    setIsPreJoinComplete(true); // Mark PreJoin as complete
  };

  const handleError = React.useCallback((error: Error) => {
    console.error(error);
    alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`);
  }, []);

  const handleOnLeave = React.useCallback(() => {
    window.location.href = '/exit'; // Redirect to home
  }, []);

  const connectOptions = useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!token || !serverUrl) {
    return (
      <>
        {!isPreJoinComplete ? (
          <PreJoin
            onError={handleError}
            onSubmit={handlePreJoinSubmit} // Pass the entire values object
            defaults={{
              username: 'test_user',
              videoEnabled: true,
              audioEnabled: true,
            }}
            data-lk-theme="default"
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
      // connectOptions={connectOptions}
      serverUrl={serverUrl}
      onDisconnected={handleOnLeave}
      onError={handleError} // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: '100vh' }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <VideoConference />

      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
      {/* Controls for the user to start/stop audio, video, and screen
        share tracks and to leave the room. */}
      <ControlBar />
    </LiveKitRoom>
  );
}
