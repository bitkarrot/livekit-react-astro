import React from 'react';
import { Participant, Track } from 'livekit-client';
import { useTracks, useParticipantContext } from '@livekit/components-react';
import { CustomAvatar } from './CustomAvatar';
import './CustomParticipantTile.css';

// CustomParticipantTile component
export function CustomParticipantTile({
  participant,
  className,
  ...props
}: {
  participant: Participant;
  className?: string;
  [key: string]: any;
}) {
  // Get display name
  const displayName = participant.name || participant.identity || 'Guest';

  // Get video and audio tracks using the correct LiveKit hooks
  const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
  const microphonePublication = participant.getTrackPublication(Track.Source.Microphone);

  // Track if the user has enabled their camera and microphone
  const hasEnabledCamera = cameraPublication &&
    cameraPublication.isSubscribed &&
    cameraPublication.track &&
    !cameraPublication.isMuted;

  const isAudioMuted = !microphonePublication || microphonePublication.isMuted;

  // Prepare the video container
  const containerClassName = `custom-participant-tile ${className || ''}`;

  return (
    <div className={containerClassName} {...props}>
      {/* Video or Avatar Container */}
      <div className="video-container">
        {hasEnabledCamera ? (
          <div className="video-wrapper" />
        ) : (
          <div className="avatar-container">
            <CustomAvatar participant={participant} size="lg" />
          </div>
        )}
      </div>

      <div className="participant-info">
        <div className="participant-name">{displayName}</div>

        {/* Indicators for muted audio/video */}
        {isAudioMuted && (
          <div className="muted-indicator">🔇</div>
        )}
      </div>
    </div>
  );
}
