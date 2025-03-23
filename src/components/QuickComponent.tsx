import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
    useParticipantTile,
    TrackLoop,
    TrackRefContext, // Added missing import
    // formatChatMessageLinks,
    VideoConference,
 //   Chat,
  } from '@livekit/components-react';
  
  import '@livekit/components-styles';  
  import React, { useState, useEffect } from 'react';

  import { Track,
        type VideoCodec,
        LogLevel,
        type RoomConnectOptions,
  } from 'livekit-client';
  
  import { DebugMode } from '~/lib/Debug';
  import { SettingsMenu } from '~/lib/SettingsMenu';
  import { useMemo } from 'react';

  export default function Page() {
    const [token, setToken] = useState<string | undefined>();
    const [serverUrl, setServerUrl] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      async function fetchToken(roomName: string, participantName: string) {
        try {
          // You can customize these parameters as needed
         // const roomName = 'test_room';
         // const participantName = 'test_user';
          const response = await fetch(`/api/get-token?roomName=${roomName}&participantName=${participantName}`);

          if (!response.ok) {
            throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          setToken(data.token);
          setServerUrl(data.url);
          setIsLoading(false);
        } catch (err) {
          console.error('Error fetching token:', err);
          setError(err.message);
          setIsLoading(false);
        }
      }

      fetchToken('test_room', 'test_user');
    }, []);

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
    
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (!token || !serverUrl) {
      return <div>Failed to initialize: Missing token or server URL</div>;
    }

    return (
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        onDisconnected={handleOnLeave}
        onError={handleError}
        // Use the default LiveKit theme for nice styles.
        data-lk-theme="default"
        style={{ height: '100vh' }}
      >
        {/* Your custom component with basic video conferencing functionality. */}         
          <VideoConference />

        {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
        <RoomAudioRenderer /> 
        {/* Controls for the user to start/stop audio, video, and screen
        share tracks and to leave the room. */}
        <ControlBar/> 
      </LiveKitRoom>
    );
  }
  
  function MyVideoConference() {
    // `useTracks` returns all camera and screen share tracks. If a user
    // joins without a published camera track, a placeholder track is returned.
    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
      ],
      { onlySubscribed: false },
    );
    return (
      <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
        {/* The GridLayout accepts zero or one child. The child is used
        as a template to render all passed in tracks. */}
         <TrackLoop tracks={tracks}>
          <TrackRefContext.Consumer>
            {(trackRef) => trackRef && <CustomParticipantTile trackRef={trackRef} />}
          </TrackRefContext.Consumer>
        </TrackLoop>
      </GridLayout>
    );
  }

  function CustomParticipantTile({ trackRef }) {
    const { htmlProps, onParticipantClick, disableSpeakingIndicator } = useParticipantTile({ trackRef });

    return (
      <ParticipantTile
        trackRef={trackRef}
        onParticipantClick={onParticipantClick}
        disableSpeakingIndicator={disableSpeakingIndicator}
        {...htmlProps} // Spread the props for additional attributes
      >
        <img src={trackRef.participant.avatarUrl || 'default-avatar.jpg'} alt={`${trackRef.participant.name}'s avatar`} />
        <span>{trackRef.participant.name}</span>
      </ParticipantTile>
    );
  }
