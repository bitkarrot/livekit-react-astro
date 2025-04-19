import {
  useParticipants,
  ParticipantLoop,
  ParticipantName,
  useParticipantAttribute,
  ParticipantContext,
  useRoomContext,
} from "@livekit/components-react";
import {
  FaCrown,
  FaMicrophone,
  FaMicrophoneSlash,
  FaUserMinus,
} from "react-icons/fa"; // Icons for moderator, mute, and kick
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
  const isMicrophoneEnabled = participant
    .getTrackPublications()
    .some((pub) => pub.kind === "audio" && !pub.isMuted);

  // Handle mute/unmute
  const handleMute = useCallback(async () => {
    // console.log("mute participant", participant.identity);
    // console.log("participant identity", participant.identity);
    // console.log("room.localParticipant.identity", room.localParticipant.identity);

    if (participant.identity === room.localParticipant.identity) {
      console.log("muting local participant", room.localParticipant);
      console.log("isMicrophoneEnabled", !participant.isMicrophoneEnabled);
      room.localParticipant.setMicrophoneEnabled(
        !participant.isMicrophoneEnabled,
      );
      return;
    }

    if (!token) {
      console.error("Token is required");
      throw Error("Token is required");
    }
    if (room.remoteParticipants.has(participant.identity)) {
      console.log("CALL /api/mute-user - mute remote participant", participant.identity);
          try {
            const response = await fetch("/api/mute-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                roomName: room.name,
                identity: participant.identity,
              }),
            });
            if (!response.ok) {
              throw new Error("Failed to mute participant");
            }
          } catch (error) {
            console.error("Failed to mute participant:", error);
          }
    }
  }, [room, participant, isMicrophoneEnabled]);

  // Handle kick
  const handleKick = useCallback(async () => {
    try {
      console.log("kick participant", participant.identity);
      if (!token) {
        console.error("Token is required");
        throw Error("Token is required");
      }
      if (room.remoteParticipants.has(participant.identity)) {
        console.log("CALL API - Kick remote participant", participant.identity);
            try {
              const response = await fetch("/api/kick-user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  roomName: room.name,
                  identity: participant.identity,
                }),
              });
              console.log("response", response);
              if (!response.ok) {
                throw new Error("Failed to mute participant");
              }
            } catch (error) {
              console.error("Failed to mute participant:", error);
            }
      }
    } catch (error) {
      console.error("Failed to kick participant:", error);
    }
  }, [room, participant]);

  return (
    <tr>
      <td className="moderator-cell">
        {isModerator && (
          <span className="moderator-icon">
            <FaCrown title="Moderator" />
          </span>
        )}
        {owner && (
          <span className="owner-icon">
            <FaCrown title="Owner" />
          </span>
        )}
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
          {participant.isMicrophoneEnabled ? (
            <span className="microphone-icon" style={{ color: "white" }}>
              <FaMicrophone />
            </span>
          ) : (
            <span className="microphone-slash-icon">
              <FaMicrophoneSlash />
            </span>
          )}
        </button>
      </td>
      <td>
        <button
          onClick={handleKick}
          title="Kick"
          className="action-button kick-button"
        >
          <span className="user-minus-icon">
            <FaUserMinus />
          </span>
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
