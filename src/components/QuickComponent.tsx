import {
  VideoConference,
  ControlBar,
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  useTracks,
  useParticipantInfo,
  TrackLoop,
  TrackRefContext,
  PreJoin,
  RoomAudioRenderer,
} from '@livekit/components-react';

import '@livekit/components-styles';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import {
  Track,
  LogLevel,
  type VideoCodec,
  type RoomConnectOptions,
  Participant,
  RoomEvent
} from 'livekit-client';

import { CustomAvatar } from './CustomAvatar';
import { CustomParticipantTile } from './CustomParticipantTile';
import { ModeratorControls } from './ModeratorControls';

import './QuickComponent.css';

export default function QuickComponent() {
  const [token, setToken] = useState<string | undefined>();
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLocalParticipantModerator, setIsLocalParticipantModerator] = useState(false);
  const [joined, setJoined] = useState(false);

  const fetchToken = async (roomName: string, participantName: string) => {
    try {
      const response = await fetch(`/api/get-token?roomName=${roomName}&participantName=${participantName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setToken(data.token);
      setServerUrl(import.meta.env.LIVEKIT_WS_URL || 'ws://localhost:7880');

      // Mark the local participant as a moderator for testing purposes
      setIsLocalParticipantModerator(true);

      return { data };
    } catch (err) {
      console.error('Error fetching token:', err);
      setError(err as Error);
      return { error: err };
    }
  };

  const handlePreJoinSubmit = async (values: {
    username: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    videoDeviceId?: string;
    audioDeviceId?: string;
  }) => {
    setVideoEnabled(values.videoEnabled);
    setAudioEnabled(values.audioEnabled);
    console.log('PreJoin values:', values);
    await fetchToken('test_room', values.username);
    setIsPreJoinComplete(true);
    setJoined(true);
  };

  const handleError = useCallback((error: Error) => {
    console.error(error);
    setError(error);
    alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`);
  }, []);

  const handleOnLeave = useCallback(() => {
    window.location.href = '/exit'; // Redirect to home
  }, []);

  const connectOptions = useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!token || !serverUrl) {
    return (
      <>
        {!isPreJoinComplete ? (
          <PreJoin
            onError={handleError}
            onSubmit={handlePreJoinSubmit}
            defaults={{
              username: 'test_user',
              videoEnabled: true,
              audioEnabled: true,
            }}
            data-lk-theme="default"
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
      data-lk-theme="default"
      style={{ height: '100vh' }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <VideoConference />

      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer/>

      {/* Add moderator controls if the user is a moderator */}
      {isLocalParticipantModerator && <ModeratorControls isLocalParticipantModerator={isLocalParticipantModerator} />}

      {/* Controls for the user to start/stop audio, video, and screen share tracks and to leave the room. */}
      <ControlBar />
    </LiveKitRoom>
  );
}
