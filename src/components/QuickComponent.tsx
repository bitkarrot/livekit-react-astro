import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
    formatChatMessageLinks,
    VideoConference,
 //   Chat,
  } from '@livekit/components-react';
  
  import '@livekit/components-styles';  
  import React from 'react';

  import { Track,
        type VideoCodec,
        LogLevel,
//        VideoPresets,
  } from 'livekit-client';
  
  import { DebugMode } from '~/lib/Debug';
  import { SettingsMenu } from '~/lib/SettingsMenu';
  import { useMemo } from 'react';

  const serverUrl = 'wss://thehive-g3v6mhu7.livekit.cloud';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDE3NTExNjAsImlzcyI6IkFQSW1RV0daOFRyQ0VkdiIsIm5hbWUiOiJ0ZXN0X3VzZXIiLCJuYmYiOjE3NDE2NjQ3NjAsInN1YiI6InRlc3RfdXNlciIsInZpZGVvIjp7InJvb20iOiJ0ZXN0X3Jvb20iLCJyb29tSm9pbiI6dHJ1ZX19.7ct4huaMpXlnPdfqf3gZjn3twHTRlAcK_BIANbdhXIw';
  
  export default function Page() {
    const handleError = React.useCallback((error: Error) => {
        console.error(error);
        alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`);
      }, []);
    
    const handleOnLeave = React.useCallback(() => {
        window.location.href = '/exit'; // Redirect to home
      }, []);
    
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
         <MyVideoConference /> 
        {/* <VideoConference
          chatMessageFormatter={formatChatMessageLinks} />
        */}

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
        <ParticipantTile/>
      </GridLayout>
    );
  }