import type {
  CreateLocalTracksOptions,
  LocalAudioTrack,
  LocalTrack,
  LocalVideoTrack,
  TrackProcessor,
} from 'livekit-client';
import {
  createLocalAudioTrack,
  createLocalTracks,
  createLocalVideoTrack,
  facingModeFromLocalTrack,
  Track,
  VideoPresets,
  Mutex,
} from 'livekit-client';
import React, { useEffect } from 'react';
import type { LocalUserChoices } from '@livekit/components-core';
import { log } from '@livekit/components-core';
import { roomOptionsStringifyReplacer } from '../utils';

import { MediaDeviceMenu, TrackToggle, ParticipantPlaceholder } from '@livekit/components-react';
import { useMediaDevices, usePersistentUserChoices } from '@livekit/components-react';

export interface PreJoinProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onError'> {
  onSubmit?: (values: LocalUserChoices) => void;
  onValidate?: (values: LocalUserChoices) => boolean;
  onError?: (error: Error) => void;
  defaults?: Partial<LocalUserChoices>;
  debug?: boolean;
  joinLabel?: string;
  micLabel?: string;
  camLabel?: string;
  userLabel?: string;
  persistUserChoices?: boolean;
  videoProcessor?: TrackProcessor<Track.Kind.Video>;
}

export function usePreviewTracks(options: CreateLocalTracksOptions, onError?: (err: Error) => void) {
  const [tracks, setTracks] = React.useState<LocalTrack[]>();

  const trackLock = React.useMemo(() => new Mutex(), []);

  React.useEffect(() => {
    let needsCleanup = false;
    let localTracks: Array<LocalTrack> = [];
    trackLock.lock().then(async (unlock) => {
      try {
        if (options.audio || options.video) {
          localTracks = await createLocalTracks(options);
          if (needsCleanup) {
            localTracks.forEach((tr) => tr.stop());
          } else {
            setTracks(localTracks);
          }
        }
      } catch (e: unknown) {
        if (onError && e instanceof Error) {
          onError(e);
        } else {
          log.error(e);
        }
      } finally {
        unlock();
      }
    });

    return () => {
      needsCleanup = true;
      localTracks.forEach((track) => {
        track.stop();
      });
    };
  }, [JSON.stringify(options, roomOptionsStringifyReplacer), onError, trackLock]);

  return tracks;
}

export function PreJoin({
  defaults = {},
  onValidate,
  onSubmit,
  onError,
  debug,
  joinLabel = 'Join Room',
  micLabel = 'Microphone',
  camLabel = 'Camera',
  userLabel = 'Type your name',
  persistUserChoices = false,
  videoProcessor,
  ...htmlProps
}: PreJoinProps) {
  const {
    userChoices: initialUserChoices,
    saveAudioInputDeviceId,
    saveAudioInputEnabled,
    saveVideoInputDeviceId,
    saveVideoInputEnabled,
    saveUsername,
  } = usePersistentUserChoices({
    defaults,
    preventSave: !persistUserChoices,
    preventLoad: !persistUserChoices,
  });

  const [userChoices, setUserChoices] = React.useState(initialUserChoices);
  const [audioEnabled, setAudioEnabled] = React.useState<boolean>(userChoices.audioEnabled);
  const [videoEnabled, setVideoEnabled] = React.useState<boolean>(userChoices.videoEnabled);
  const [audioDeviceId, setAudioDeviceId] = React.useState<string>(userChoices.audioDeviceId);
  const [videoDeviceId, setVideoDeviceId] = React.useState<string>(userChoices.videoDeviceId);
  const [username, setUsername] = React.useState<string>('');

  // Initialize username from __nostrlogin_accounts on mount (client-side only)
  useEffect(() => {
    try {
      const accountsRaw = localStorage.getItem('__nostrlogin_accounts');
      if (accountsRaw) {
        const accounts = JSON.parse(accountsRaw);
        if (Array.isArray(accounts) && accounts.length > 0) {
          const account = accounts[0];
          const displayName = account.name?.trim();
          const initialUsername = displayName && displayName !== '' ? displayName : account.pubkey || '';
          setUsername(initialUsername);
          setUserChoices((prev) => ({ ...prev, username: initialUsername }));
        }
      }
    } catch (error) {
      console.error('Failed to parse __nostrlogin_accounts on mount:', error);
    }
  }, []);

  // Initialize nostr-login and set username from localStorage
  useEffect(() => {
    import('nostr-login')
      .then(({ init, launch }) => {
        init({
          theme: 'default',
          perms: 'sign_event:1',
          startScreen: 'login',
          onAuth: (npub: string) => {
            try {
              const accountsRaw = localStorage.getItem('__nostrlogin_accounts');
              if (accountsRaw) {
                const accounts = JSON.parse(accountsRaw);
                if (Array.isArray(accounts) && accounts.length > 0) {
                  const account = accounts[0];
                  const displayName = account.name?.trim();
                  const finalUsername = displayName && displayName !== '' ? displayName : account.pubkey || npub;
                  setUsername(finalUsername);
                } else {
                  setUsername(npub);
                }
              } else {
                setUsername(npub);
              }
            } catch (error) {
              console.error('Failed to parse __nostrlogin_accounts:', error);
              setUsername(npub);
            }
          },
        });

        // Listen for nlAuth events
        const handleNlAuth = (e: CustomEvent) => {
          const detail = e.detail;
          if (detail.type === 'login' || detail.type === 'signup') {
            try {
              const accountsRaw = localStorage.getItem('__nostrlogin_accounts');
              if (accountsRaw) {
                const accounts = JSON.parse(accountsRaw);
                if (Array.isArray(accounts) && accounts.length > 0) {
                  const account = accounts[0];
                  const displayName = account.name?.trim();
                  const finalUsername = displayName && displayName !== '' ? displayName : account.pubkey || detail.npub;
                  setUsername(finalUsername);
                } else {
                  setUsername(detail.npub);
                }
              } else {
                setUsername(detail.npub);
              }
            } catch (error) {
              console.error('Failed to parse __nostrlogin_accounts:', error);
              setUsername(detail.npub);
            }
          } else if (detail.type === 'logout') {
            setUsername('');
            // Note: nostr-login may handle clearing __nostrlogin_accounts
          }
        };
        document.addEventListener('nlAuth', handleNlAuth as EventListener);

        return () => {
          document.removeEventListener('nlAuth', handleNlAuth as EventListener);
        };
      })
      .catch((error) => console.error('Failed to load nostr-login', error));
  }, []);

  // Handle login button click
  const handleNostrLogin = () => {
    import('nostr-login').then(({ launch }) => {
      launch({ startScreen: 'login' });
    });
  };

  React.useEffect(() => {
    saveAudioInputEnabled(audioEnabled);
  }, [audioEnabled, saveAudioInputEnabled]);
  React.useEffect(() => {
    saveVideoInputEnabled(videoEnabled);
  }, [videoEnabled, saveVideoInputEnabled]);
  React.useEffect(() => {
    saveAudioInputDeviceId(audioDeviceId);
  }, [audioDeviceId, saveAudioInputDeviceId]);
  React.useEffect(() => {
    saveVideoInputDeviceId(videoDeviceId);
  }, [videoDeviceId, saveVideoInputDeviceId]);
  React.useEffect(() => {
    saveUsername(username);
  }, [username, saveUsername]);

  const tracks = usePreviewTracks(
    {
      audio: audioEnabled ? { deviceId: initialUserChoices.audioDeviceId } : false,
      video: videoEnabled
        ? { deviceId: initialUserChoices.videoDeviceId, processor: videoProcessor }
        : false,
    },
    onError,
  );

  const videoEl = React.useRef(null);

  const videoTrack = React.useMemo(
    () => tracks?.filter((track) => track.kind === Track.Kind.Video)[0] as LocalVideoTrack,
    [tracks],
  );

  const facingMode = React.useMemo(() => {
    if (videoTrack) {
      const { facingMode } = facingModeFromLocalTrack(videoTrack);
      return facingMode;
    } else {
      return 'undefined';
    }
  }, [videoTrack]);

  const audioTrack = React.useMemo(
    () => tracks?.filter((track) => track.kind === Track.Kind.Audio)[0] as LocalAudioTrack,
    [tracks],
  );

  React.useEffect(() => {
    if (videoEl.current && videoTrack) {
      videoTrack.unmute();
      videoTrack.attach(videoEl.current);
    }

    return () => {
      videoTrack?.detach();
    };
  }, [videoTrack]);

  const [isValid, setIsValid] = React.useState<boolean>();

  const handleValidation = React.useCallback(
    (values: LocalUserChoices) => {
      if (typeof onValidate === 'function') {
        return onValidate(values);
      } else {
        return values.username !== '';
      }
    },
    [onValidate],
  );

  React.useEffect(() => {
    const newUserChoices = {
      username,
      videoEnabled,
      videoDeviceId,
      audioEnabled,
      audioDeviceId,
    };
    setUserChoices(newUserChoices);
    setIsValid(handleValidation(newUserChoices));
  }, [username, videoEnabled, handleValidation, audioEnabled, audioDeviceId, videoDeviceId]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (handleValidation(userChoices)) {
      if (typeof onSubmit === 'function') {
        onSubmit(userChoices);
      }
    } else {
      log.warn('Validation failed with: ', userChoices);
    }
  }

  return (
    <div className="lk-prejoin" {...htmlProps}>
      <div className="lk-video-container">
        {videoTrack && (
          <video ref={videoEl} width="1280" height="720" data-lk-facing-mode={facingMode} />
        )}
        {(!videoTrack || !videoEnabled) && (
          <div className="lk-camera-off-note">
            <ParticipantPlaceholder />
          </div>
        )}
      </div>
      <div className="lk-button-group-container">
        <div className="lk-button-group audio">
          <TrackToggle
            initialState={audioEnabled}
            source={Track.Source.Microphone}
            onChange={(enabled) => setAudioEnabled(enabled)}
          >
            {micLabel}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              initialSelection={audioDeviceId}
              kind="audioinput"
              disabled={!audioTrack}
              tracks={{ audioinput: audioTrack }}
              onActiveDeviceChange={(_, id) => setAudioDeviceId(id)}
            />
          </div>
        </div>
        <div className="lk-button-group video">
          <TrackToggle
            initialState={videoEnabled}
            source={Track.Source.Camera}
            onChange={(enabled) => setVideoEnabled(enabled)}
          >
            {camLabel}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              initialSelection={videoDeviceId}
              kind="videoinput"
              disabled={!videoTrack}
              tracks={{ videoinput: videoTrack }}
              onActiveDeviceChange={(_, id) => setVideoDeviceId(id)}
            />
          </div>
        </div>
      </div>

      <form className="lk-username-container">
        {(!username || username === '') && (
          <>
            <button
              className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              id="signupButton"
              type="button"
              onClick={handleNostrLogin}
            >
              Login to Nostr
            </button>
            <center>OR</center>
          </>
        )}
        <input
          className="lk-form-control"
          id="username"
          name="username"
          type="text"
          value={username}
          placeholder={userLabel}
          onChange={(inputEl) => setUsername(inputEl.target.value)}
          autoComplete="off"
        />
        <button
          className="lk-button lk-join-button"
          type="submit"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          {joinLabel}
        </button>
      </form>

      {debug && (
        <>
          <strong>User Choices:</strong>
          <ul className="lk-list" style={{ overflow: 'hidden', maxWidth: '15rem' }}>
            <li>Username: {`${userChoices.username}`}</li>
            <li>Video Enabled: {`${userChoices.videoEnabled}`}</li>
            <li>Audio Enabled: {`${userChoices.audioEnabled}`}</li>
            <li>Video Device: {`${userChoices.videoDeviceId}`}</li>
            <li>Audio Device: {`${userChoices.audioDeviceId}`}</li>
          </ul>
        </>
      )}
    </div>
  );
}