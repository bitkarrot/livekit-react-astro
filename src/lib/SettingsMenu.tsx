// 'use client';
import React from 'react';
import { Track, LocalParticipant, Participant } from 'livekit-client';
import {
  useMaybeLayoutContext,
  MediaDeviceMenu,
  TrackToggle,
  useRoomContext,
  useParticipants,
  //  useIsRecording,
} from '@livekit/components-react';
//import { useKrispNoiseFilter } from '@livekit/components-react/krisp';
import styles from '../styles/SettingsMenu.module.css';
import ParticipantsTable from './ParticipantsTable';
// TODO: fix krisp noise filter not found, is this only available on cloud? 

/**
 * @alpha
 */
export interface SettingsMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  token?: string;
}


/**
 * @alpha
 */
export function SettingsMenu({
   token,
   ...props
  }: SettingsMenuProps) {
  const layoutContext = useMaybeLayoutContext();
  const room = useRoomContext();
  const localParticipant: LocalParticipant = room.localParticipant;
  const participants = useParticipants();

  // const remoteParticipants = room.remoteParticipants;
  // remoteParticipants.forEach((participant) => {
  //   console.log('Participant:', participant.identity);
  // });
  //  const recordingEndpoint = process.env.NEXT_PUBLIC_LK_RECORD_ENDPOINT;

  const settings = React.useMemo(() => {
    return {
      media: { camera: true, microphone: true, label: 'Media Devices', speaker: true },
      // effects: { label: 'Effects' },
      moderation: { label: 'Moderation' },
      // recording: recordingEndpoint ? { label: 'Recording' } : undefined,
    };
  }, []);

  const tabs = React.useMemo(
    () => Object.keys(settings).filter((t) => t !== undefined) as Array<keyof typeof settings>,
    [settings],
  );
  const [activeTab, setActiveTab] = React.useState(tabs[0]);

  // const { isNoiseFilterEnabled, setNoiseFilterEnabled, isNoiseFilterPending } =
  //   useKrispNoiseFilter();

  // console.log('isNoiseFilterEnabled', isNoiseFilterEnabled);
  // console.log('isNoiseFilterPending', isNoiseFilterPending)

  // React.useEffect(() => {
  //   // enable Krisp by default
  //   setNoiseFilterEnabled(true);
  // }, []);

  // const isRecording = useIsRecording();
  // const [initialRecStatus, setInitialRecStatus] = React.useState(isRecording);
  // const [processingRecRequest, setProcessingRecRequest] = React.useState(false);

  // React.useEffect(() => {
  //   if (initialRecStatus !== isRecording) {
  //     setProcessingRecRequest(false);
  //   }
  // }, [isRecording, initialRecStatus]);

  // const toggleRoomRecording = async () => {
  //   if (!recordingEndpoint) {
  //     throw TypeError('No recording endpoint specified');
  //   }
  //   if (room.isE2EEEnabled) {
  //     throw Error('Recording of encrypted meetings is currently not supported');
  //   }
  //   setProcessingRecRequest(true);
  //   setInitialRecStatus(isRecording);
  //   let response: Response;
  //   if (isRecording) {
  //     response = await fetch(recordingEndpoint + `/stop?roomName=${room.name}`);
  //   } else {
  //     response = await fetch(recordingEndpoint + `/start?roomName=${room.name}`);
  //   }
  //   if (response.ok) {
  //   } else {
  //     console.error(
  //       'Error handling recording request, check server logs:',
  //       response.status,
  //       response.statusText,
  //     );
  //     setProcessingRecRequest(false);
  //   }
  // };

  return (
    <div className="settings-menu" style={{ width: '100%' }} {...props}>
      <div className={styles.tabs}>
        {tabs.map(
          (tab: string) =>
            settings[tab as keyof typeof settings] && (
              <button
                className={`${styles.tab} lk-button`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-pressed={tab === activeTab}
              >
                {
                  // @ts-ignore
                  settings[tab].label
                }
              </button>
            ),
        )}
      </div>
      <div className="tab-content">
        {activeTab === 'media' && (
          <>
            {settings.media && settings.media.camera && (
              <>
                <h3 style={{ marginTop: '20px' }}>Camera</h3>
                <section className="lk-button-group">
                  <TrackToggle source={Track.Source.Camera}>Camera</TrackToggle>
                  <div className="lk-button-group-menu">
                    <MediaDeviceMenu kind="videoinput" />
                  </div>
                </section>
              </>
            )}
            {settings.media && settings.media.microphone && (
              <>
                <h3 style={{ marginTop: '20px' }}>Microphone</h3>
                <section className="lk-button-group">
                  <TrackToggle source={Track.Source.Microphone}>Microphone</TrackToggle>
                  <div className="lk-button-group-menu">
                    <MediaDeviceMenu kind="audioinput" />
                  </div>
                </section>
              </>
            )}
            {settings.media && settings.media.speaker && (
              <>
                <h3 style={{ marginTop: '20px' }}>Speaker & Headphones</h3>
                <section className="lk-button-group">
                  <span className="lk-button">Audio Output</span>
                  <div className="lk-button-group-menu">
                    <MediaDeviceMenu kind="audiooutput"></MediaDeviceMenu>
                  </div>
                </section>
              </>
            )}
          </>
        )}
        {/* {activeTab === 'effects' && (
          <>
            <h3 style={{ marginTop: '20px' }}>Audio</h3>
            <section style={{ marginTop: '10px' }}>
              <label htmlFor="noise-filter" style={{ marginRight: '10px' }}> Enhanced Noise Cancellation</label>
              <input
                type="checkbox"
                id="noise-filter"
                style={{ width: '20px', height: '20px' }}
                onChange={(ev) => setNoiseFilterEnabled(ev.target.checked)}
                checked={isNoiseFilterEnabled}
                disabled={isNoiseFilterPending}
              ></input>
            </section>
          </>
        )} */}
        {/* {activeTab === 'recording' && (
          <>
            <h3>Record Meeting</h3>
            <section>
              <p>
                {isRecording
                  ? 'Meeting is currently being recorded'
                  : 'No active recordings for this meeting'}
              </p>
              <button disabled={processingRecRequest} onClick={() => toggleRoomRecording()}>
                {isRecording ? 'Stop' : 'Start'} Recording
              </button>
            </section>
          </>
        )} */}
        { activeTab === 'moderation' && (
          <>
            <section style={{ marginTop: '10px' }}>
              <div style={{ marginBottom: '10px' }}>
                {/* [TODO: Only Show if mod/owner] */}
                 {/* Your name:  &nbsp;
                  { localParticipant.attributes?.petname || 'no name'}
                  <br/> */}
                  {/* is Moderator?  &nbsp;
                  { localParticipant.attributes?.moderator || 'no moderator'}
                  <br/>
                  is Owner?  &nbsp;
                  { localParticipant.attributes?.owner || 'no owner'} */}
              </div>
            </section>
            <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>User List</h3>
            <ParticipantsTable token={token}/>
          </>
        )}
      </div>
      <div className="settings-footer" style={{ marginTop: '20px', textAlign: 'right' }}>
        <button
        className={`lk-button ${styles.settingsCloseButton}`}
        onClick={() => layoutContext?.widget.dispatch?.({ msg: 'toggle_settings' })}
      >
        Close
      </button>
      </div>
    </div>
  );
}
