import { useParticipants, ParticipantLoop, ParticipantName, useParticipantAttribute, ParticipantContext, useRoomContext } from "@livekit/components-react";
import { FaCrown, FaMicrophone, FaMicrophoneSlash, FaUserMinus } from "react-icons/fa"; // Icons for moderator, mute, and kick
import React from "react";
const { useContext, useCallback } = React;

import "../styles/ParticipantsTable.css"; // For styling

function ParticipantRow() {
  const participant = useContext(ParticipantContext);
  const room = useRoomContext();

  const ownerValue = useParticipantAttribute("owner");
  const owner = ownerValue === "true";

  const moderatorValue = useParticipantAttribute("moderator");
  // Check if participant is a moderator
  const isModerator = moderatorValue === "true";

  // Handle mute/unmute
  const handleMute = useCallback(() => {
    room.localParticipant.setMicrophoneEnabled(!participant.isMicrophoneEnabled);
  }, [room, participant]);

  // Handle kick
  const handleKick = useCallback(async () => {
    try {
        console.log('kick participant', participant.identity)
//      await room.disconnectParticipant(participant.identity);
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
          {participant.isMicrophoneEnabled ? <span className="microphone-icon"><FaMicrophone /></span> : <span className="microphone-slash-icon"><FaMicrophoneSlash /></span>}
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

function ParticipantsTable() {
  const participants = useParticipants();

  return (
    <div>
      <table className="participants-table">
        <tbody>
          <ParticipantLoop participants={participants}>
            <ParticipantRow />
          </ParticipantLoop>
        </tbody>
      </table>
    </div>
  );
}

export default ParticipantsTable;