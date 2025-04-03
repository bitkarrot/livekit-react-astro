import React, { useEffect } from 'react';
import './QuickComponent.css';

interface CustomAvatarProps {
  participantIdentity: string;
  avatarUrl?: string;
  initials?: string;
}

export default function CustomAvatar({ 
  participantIdentity, 
  avatarUrl, 
  initials = 'TU' 
}: CustomAvatarProps) {
  
  useEffect(() => {
    // Find all placeholder elements for this participant
    const placeholders = document.querySelectorAll(
      `.lk-participant[data-lk-participant-id="${participantIdentity}"] .lk-participant-placeholder`
    );
    
    placeholders.forEach(placeholder => {
      // Set initials as data attribute
      placeholder.setAttribute('data-initials', initials);
      
      // If avatar URL is provided, add the has-avatar class and set background image
      if (avatarUrl) {
        placeholder.classList.add('has-avatar');
        (placeholder as HTMLElement).style.setProperty(
          '--avatar-url', 
          `url(${avatarUrl})`
        );
      } else {
        placeholder.classList.remove('has-avatar');
      }
    });
    
    return () => {
      // Cleanup when component unmounts
      placeholders.forEach(placeholder => {
        placeholder.removeAttribute('data-initials');
        placeholder.classList.remove('has-avatar');
        (placeholder as HTMLElement).style.removeProperty('--avatar-url');
      });
    };
  }, [participantIdentity, avatarUrl, initials]);
  
  // This component doesn't render anything visible directly
  return null;
}
