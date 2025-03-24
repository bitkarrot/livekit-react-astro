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
  useLiveKitRoom,
  useParticipants,
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

// Simple avatar component for PreJoin screen
function PreJoinAvatar({ username = 'Guest User' }: { username?: string }) {
  // Calculate initials from username
  const initials = username
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className="lk-camera-off-note"
      data-initials={initials}
      aria-label={`Avatar for ${username}`}
    >
      {/* We'll use CSS to display the initials via the data-initials attribute */}
    </div>
  );
}

// Custom hook to apply participant metadata for avatars
function useParticipantAvatars() {
  const participants = useParticipants();

  useEffect(() => {
    // Function to apply avatar backgrounds from metadata
    const applyAvatarBackgrounds = () => {
      participants.forEach(participant => {
        try {
          if (participant.metadata) {
            const metadata = JSON.parse(participant.metadata);
            if (metadata.avatar) {
              // Find placeholder elements for this participant
              const placeholders = document.querySelectorAll(
                `.lk-participant-placeholder[data-lk-participant-id="${participant.identity}"]`
              );

              // Apply background image to all placeholders for this participant
              placeholders.forEach(placeholder => {
                (placeholder as HTMLElement).style.backgroundImage = `url(${metadata.avatar})`;
                placeholder.setAttribute('data-lk-participant-metadata', JSON.stringify(metadata));
              });
            }
          }
        } catch (error) {
          console.warn('Failed to parse participant metadata:', error);
        }
      });
    };

    // Apply immediately and set up an interval to keep checking
    applyAvatarBackgrounds();
    const intervalId = setInterval(applyAvatarBackgrounds, 2000);

    return () => clearInterval(intervalId);
  }, [participants]);
}

// Component that will be rendered inside the LiveKitRoom with access to context
function AvatarManager() {
  useParticipantAvatars();
  // Log when component is mounted to confirm it's working
  useEffect(() => {
    console.log('AvatarManager mounted - monitoring participants for custom avatars');
  }, []);
  return null; // This component doesn't render anything visible
}

export default function QuickComponent() {
  const [token, setToken] = useState<string | undefined>();
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLocalParticipantModerator, setIsLocalParticipantModerator] = useState(false);
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState('');

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

  const handlePreJoinSubmit = useCallback(async (values: {
    username: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    videoDeviceId?: string;
    audioDeviceId?: string;
  }) => {
    setVideoEnabled(values.videoEnabled);
    setAudioEnabled(values.audioEnabled);
    console.log('PreJoin values:', values);
    setUsername(values.username);

    // Create default avatar URL using initials
    const initials = values.username
      .trim()
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    // Generate avatar URL (you can replace this with your own avatar URL service)
    const avatarUrl = `https://placehold.co/400x400/16213e/ffffff?text=${encodeURIComponent(initials)}`;

    // Update participant metadata for avatar
    fetch('/api/update-participant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName: 'test_room',
        identity: values.username,
        metadata: {
          avatar: avatarUrl
        }
      })
    }).catch(err => {
      console.error('Failed to update participant metadata:', err);
    });

    await fetchToken('test_room', values.username);
    setIsPreJoinComplete(true);
    setJoined(true);
  }, []);

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
            onSubmit={handlePreJoinSubmit}
            onError={handleError}
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
      serverUrl={serverUrl}
      onDisconnected={handleOnLeave}
      onError={handleError}
      data-lk-theme="default"
      style={{ height: '100vh' }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <VideoConference
        style={{
          height: 'calc(100vh - 0px)',
          width: '100%'
        }}
      />

      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer/>

      {/* Apply custom avatars based on metadata */}
      <AvatarManager />

      {/* Controls for the user to start/stop audio, video, and screen share tracks and to leave the room. */}
      <ControlBar />
      {isLocalParticipantModerator && (
        <ModeratorControls isLocalParticipantModerator={isLocalParticipantModerator} />
      )}
    </LiveKitRoom>
  );
}
