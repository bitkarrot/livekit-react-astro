import React from 'react';
import { Participant } from 'livekit-client';
import './CustomAvatar.css';

interface CustomAvatarProps {
  participant: Participant;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomAvatar({ participant, size = 'md' }: CustomAvatarProps) {
  // Get name or identity from participant
  const displayName = participant.name || participant.identity || 'Guest';
  const initials = displayName.substring(0, 2).toUpperCase();
  
  // Size class mapping
  const sizeClass = {
    sm: 'custom-avatar-circle-sm',
    md: 'custom-avatar-circle-md',
    lg: 'custom-avatar-circle-lg'
  }[size];

  // Try to parse metadata for avatar image URL
  let avatarUrl: string | undefined;
  try {
    if (participant.metadata) {
      const metadata = JSON.parse(participant.metadata);
      avatarUrl = metadata.avatar;
    }
  } catch (error) {
    console.warn('Failed to parse participant metadata:', error);
  }
  
  return (
    <div className={`custom-avatar-circle ${sizeClass}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Avatar for ${displayName}`}
          className="custom-avatar-image"
          onError={(e) => {
            // If image fails to load, fall back to initials
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="custom-avatar-initials">${initials}</span>`;
            }
          }}
        />
      ) : (
        <span className="custom-avatar-initials">{initials}</span>
      )}
    </div>
  );
}
