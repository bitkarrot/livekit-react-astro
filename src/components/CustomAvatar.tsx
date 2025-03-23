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
  
  return (
    <div className={`custom-avatar-circle ${sizeClass}`}>
      <span className="custom-avatar-initials">{initials}</span>
    </div>
  );
}
