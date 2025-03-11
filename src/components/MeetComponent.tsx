'use client';
import React, { Suspense, useState } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '../../lib/client-utils';
import styles from '../../styles/Home.module.css';


function DemoMeetingTab({ label, e2ee = false, sharedPassphrase = randomString(64) }) {
  const startMeeting = () => {
    console.log("Start Meeting Clicked");
    const roomId = generateRoomId();
    console.log("Room ID: ", roomId);
    const passphrase = e2ee ? `#${encodePassphrase(sharedPassphrase)}` : '';
    window.location.href = `/rooms/${roomId}${passphrase}`;
  };
  return (
    <div className={styles.tabContent}>
      <p style={{ margin: 0 }}>Try LiveKit Meet for free with our live demo project.</p>
      <button style={{ marginTop: '1rem' }} className="lk-button" onClick={startMeeting}>
        Start Meeting
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => console.log(ev.target.checked)}
          ></input>
          <label htmlFor="use-e2ee">Enable end-to-end encryption</label>
        </div>
        {e2ee && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <label htmlFor="passphrase">Passphrase</label>
            <input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => console.log(ev.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}


export default function Page() {
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        <div className="header">
          <img src="/images/livekit-meet-home.svg" alt="LiveKit Meet" width="360" height="45" />
          <h2>
            Open source video conferencing app built on{' '}
            <a href="https://github.com/livekit/components-js?ref=meet" rel="noopener">
              LiveKit&nbsp;Components
            </a>
            ,{' '}
            <a href="https://livekit.io/cloud?ref=meet" rel="noopener">
              LiveKit&nbsp;Cloud
            </a>{' '}
            and Next.js.
          </h2>
        </div>
        <Suspense fallback="Loading">
          {/* <Tabs> */}
            <DemoMeetingTab label="Demo" e2ee={e2ee} sharedPassphrase={sharedPassphrase} />
            {/* <CustomConnectionTab label="Custom" /> */}
          {/* </Tabs> */}
        </Suspense>
      </main>
      <footer data-lk-theme="default">
        Hosted on{' '}
        <a href="https://livekit.io/cloud?ref=meet" rel="noopener">
          LiveKit Cloud
        </a>
        . Source code on{' '}
        <a href="https://github.com/livekit/meet?ref=meet" rel="noopener">
          GitHub
        </a>
        .
      </footer>
    </>
  );
}
