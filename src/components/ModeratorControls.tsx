import React, { useState } from 'react';
import {
  useRoomContext,
  useParticipants
} from '@livekit/components-react';
import { RemoteParticipant, Room, Track, TrackPublication } from 'livekit-client';
import './ModeratorControls.css';

interface ModeratorControlsProps {
  isLocalParticipantModerator: boolean;
}

export function ModeratorControls({ isLocalParticipantModerator }: ModeratorControlsProps) {
  const [isPromoting, setIsPromoting] = useState<Record<string, boolean>>({});
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});
  const [isMuting, setIsMuting] = useState<Record<string, boolean>>({});
  
  // Get the room and participants
  const room = useRoomContext();
  const participants = useParticipants();
  
  // Only remote participants (not the local user)
  const remoteParticipants = participants.filter(
    (p) => p.identity !== room.localParticipant.identity
  ) as RemoteParticipant[];
  
  // Helper to check if a participant has a track of a certain kind
  const hasTrackPublished = (participant: RemoteParticipant, source: Track.Source): boolean => {
    // Convert the Map to an array and then use some
    return Array.from(participant.trackPublications.values()).some(
      (publication: TrackPublication) => publication.source === source && publication.isSubscribed
    );
  };
  
  // Promote participant to moderator
  const handlePromoteToModerator = async (participant: RemoteParticipant) => {
    setIsPromoting(prev => ({ ...prev, [participant.identity]: true }));
    
    try {
      const response = await fetch('/api/promote-moderator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: participant.identity,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to promote participant');
      }
      
      // Success notification could be added here
      console.log(`Promoted ${participant.identity} to moderator`);
    } catch (error) {
      console.error('Error promoting participant:', error);
      // Error notification could be added here
    } finally {
      setIsPromoting(prev => ({ ...prev, [participant.identity]: false }));
    }
  };
  
  // Mute a participant's audio - this needs to be done server-side
  const handleMuteParticipant = async (participant: RemoteParticipant) => {
    setIsMuting(prev => ({ ...prev, [participant.identity]: true }));
    
    try {
      // Create a server endpoint similar to the promote-moderator endpoint
      const response = await fetch('/api/mute-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: participant.identity,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mute participant');
      }
      
      console.log(`Muted ${participant.identity}`);
    } catch (error) {
      console.error('Error muting participant:', error);
      // We can't directly mute other participants from the client side
      // The proper way to do this would be implementing the api/mute-participant endpoint
      // For now, just log the error
      console.warn('Server-side muting is required. Please implement the /api/mute-participant endpoint.');
    } finally {
      setIsMuting(prev => ({ ...prev, [participant.identity]: false }));
    }
  };
  
  // Remove participant from room
  const handleRemoveParticipant = async (participant: RemoteParticipant) => {
    setIsRemoving(prev => ({ ...prev, [participant.identity]: true }));
    
    try {
      const response = await fetch('/api/remove-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: participant.identity,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove participant');
      }
      
      console.log(`Removed ${participant.identity} from room`);
    } catch (error) {
      console.error('Error removing participant:', error);
    } finally {
      setIsRemoving(prev => ({ ...prev, [participant.identity]: false }));
    }
  };
  
  // If the local participant is not a moderator, don't show the controls
  if (!isLocalParticipantModerator) {
    return null;
  }
  
  return (
    <div className="moderator-controls">
      <h3>Moderator Controls</h3>
      
      {remoteParticipants.length === 0 ? (
        <div className="no-participants">No other participants in the room</div>
      ) : (
        <div className="participant-list">
          {remoteParticipants.map((participant) => (
            <div key={participant.identity} className="participant-controls">
              <div className="participant-name">
                {participant.name || participant.identity}
              </div>
              
              <div className="participant-buttons">
                <button
                  onClick={() => handlePromoteToModerator(participant)}
                  disabled={isPromoting[participant.identity]}
                  className="promote-button"
                >
                  {isPromoting[participant.identity] ? 'Promoting...' : 'Promote to Moderator'}
                </button>
                
                <button
                  onClick={() => handleMuteParticipant(participant)}
                  disabled={isMuting[participant.identity] || !hasTrackPublished(participant, Track.Source.Microphone)}
                  className="mute-button"
                >
                  {isMuting[participant.identity] ? 'Muting...' : 'Mute'}
                </button>
                
                <button
                  onClick={() => handleRemoveParticipant(participant)}
                  disabled={isRemoving[participant.identity]}
                  className="remove-button"
                >
                  {isRemoving[participant.identity] ? 'Removing...' : 'Remove from Room'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
