'use client';
import React from 'react';
import {
  useMaybeLayoutContext,
} from '@livekit/components-react';
import styles from '../styles/SettingsMenu.module.css';
// TODO replace this with a new css for nostr profile

export interface NostrProfileProps extends React.HTMLAttributes<HTMLDivElement> {}

export function NostrProfile(props: NostrProfileProps) {
  const layoutContext = useMaybeLayoutContext();
  return (
    <div className="settings-menu" style={{ width: '100%' }} {...props}>
      <div className="tab-content">
        <h3 style={{ marginTop: '10px' }}>Nostr Profile</h3>
        <p>TODO: Nostr Profile</p>
      </div>
      <button
        className={`lk-button ${styles.settingsCloseButton}`}
        onClick={() => layoutContext?.widget.dispatch?.({ msg: 'toggle_settings' })}
      >
        Close
      </button>
    </div>
  );
}
