import { useParticipants, ParticipantLoop, ParticipantName, useParticipantAttribute, ParticipantContext, useRoomContext } from "@livekit/components-react";
import { FaCrown, FaMicrophone, FaMicrophoneSlash, FaUserMinus } from "react-icons/fa"; // Icons for moderator, mute, and kick
import React from "react";
const { useContext, useCallback } = React;

import "../styles/ParticipantsTable.css"; // For styling

function ParticipantRow({ token }: { token?: string }) {
  const participant = useContext(ParticipantContext);
  const room = useRoomContext();

  const ownerValue = useParticipantAttribute("owner");
  const owner = ownerValue === "true";

  const moderatorValue = useParticipantAttribute("moderator");
  // Check if participant is a moderator
  const isModerator = moderatorValue === "true";

  // Determine if the participant's microphone is enabled
  const isMicrophoneEnabled = participant.getTrackPublications().some(pub => pub.kind === 'audio' && !pub.isMuted);

  // Handle mute/unmute
  const handleMute = useCallback(async () => {
    const audioPublication = participant.getTrackPublications().find(pub => pub.kind === 'audio');
    if (audioPublication && audioPublication.trackSid) {
      const trackSid = audioPublication.trackSid;
      const mute = !isMicrophoneEnabled;
      console.log('trackSid', trackSid);
      console.log('mute', mute);

    if (!token) {
      console.error("Token is required");
      return;
    }

    try {
      const response = await fetch('/api/mute-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomName: room.name,
          identity: participant.identity,
          trackSid: trackSid,
          mute: mute,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mute participant');
      }
    } catch (error) {
      console.error('Failed to mute participant:', error);
    }
  } else {
    console.error('No audio track found for participant');
  }
  }, [room, participant, isMicrophoneEnabled]);

    // console.log('room name', room.name)
    // console.log('mute participant', participant.identity);
    // console.log('tracksid', participant.trackSid)
    // console.log('setMicrophoneEnabled', !participant.isMicrophoneEnabled)
    //    room.localParticipant.setMicrophoneEnabled(!participant.isMicrophoneEnabled);


  // Handle kick
  const handleKick = useCallback(async () => {
    try {
        console.log('kick participant', participant.identity)
        // await room.disconnectParticipant(participant.identity);
    } catch (error) {
      console.error("Failed to kick participant:", error);
    }
  }, [room, participant]);

  return (
    <tr>
      <td className="moderator-cell">
        {isModerator && <span className="moderator-icon"><FaCrown title="Moderator" /></span>}
        {owner && <span className="owner-icon"><FaCrown title="Owner" /></span>}
      </td>
      <td>
        <ParticipantName />
      </td>
      <td>
        <button
          onClick={handleMute}
          title={participant.isMicrophoneEnabled ? "Mute" : "Unmute"}
          className="action-button"
        >
          {participant.isMicrophoneEnabled ? <span className="microphone-icon" style={{ color: 'white' }}><FaMicrophone /></span> : <span className="microphone-slash-icon"><FaMicrophoneSlash /></span>}
        </button>
        </td>
        <td>
        <button
          onClick={handleKick}
          title="Kick"
          className="action-button kick-button"
        >
          <span className="user-minus-icon"><FaUserMinus /></span>
        </button>
      </td>
    </tr>
  );
}

function ParticipantsTable({ token }: { token?: string }) {
  const participants = useParticipants();

  return (
    <div>
      <table className="participants-table">
        <tbody>
          <ParticipantLoop participants={participants}>
            <ParticipantRow token={token} />
          </ParticipantLoop>
        </tbody>
      </table>
    </div>
  );
}

export default ParticipantsTable;