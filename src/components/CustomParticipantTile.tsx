import React from 'react';
import { Participant, Track } from 'livekit-client';
import { CustomAvatar } from './CustomAvatar';
import './CustomParticipantTile.css';

interface CustomParticipantTileProps {
  participant: Participant;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
}

export function CustomParticipantTile({ 
  participant,
  audioEnabled = true,
  videoEnabled = true
}: CustomParticipantTileProps) {
  // Get participant name or identity
  const displayName = participant.name || participant.identity || 'Guest';
  
  // Check if camera is enabled by looking at the participant's camera track
  const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
  const hasEnabledCamera = 
    cameraPublication && 
    cameraPublication.isSubscribed && 
    cameraPublication.track && 
    !cameraPublication.isMuted &&
    videoEnabled;
  
  // Check if microphone is enabled
  const micPublication = participant.getTrackPublication(Track.Source.Microphone);
  const isAudioMuted = 
    !micPublication || 
    micPublication.isMuted || 
    !audioEnabled;

  return (
    <div className="custom-participant-tile">
      <div className="participant-media">
        {hasEnabledCamera ? (
          <div className="video-container">
            {/* Let LiveKit handle the video rendering */}
            <div 
              className="video-element"
              data-lk-participant-id={participant.identity}
            ></div>
          </div>
        ) : (
          <div className="avatar-container">
            <CustomAvatar participant={participant} size="lg" />
          </div>
        )}
      </div>
      
      <div className="participant-info">
        <div className="participant-name">{displayName}</div>
        
        {/* Indicators for muted audio/video */}
        <div className="participant-indicators">
          {isAudioMuted && (
            <span className="audio-muted-indicator">🔇</span>
          )}
          {!hasEnabledCamera && (
            <span className="video-muted-indicator">📵</span>
          )}
        </div>
      </div>
    </div>
  );
}
