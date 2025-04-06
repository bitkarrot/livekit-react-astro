// VideoConference.tsx - React component for Astro
import type {
    // MessageDecoder,
    // MessageEncoder,
    TrackReferenceOrPlaceholder,
    WidgetState,
  } from '@livekit/components-core';
  import { isEqualTrackRef, isTrackReference, isWeb, log } from '@livekit/components-core';
  import { RoomEvent, Track } from 'livekit-client';
  import React from 'react';
  import type { MessageFormatter } from '@livekit/components-react';
  import {
    CarouselLayout,
    ConnectionStateToast,
    FocusLayout,
    FocusLayoutContainer,
    GridLayout,
    LayoutContextProvider,
    ParticipantTile,
    RoomAudioRenderer,
    useCreateLayoutContext,
    usePinnedTracks,
    useTracks,
  } from '@livekit/components-react';
  import { Chat } from '@livekit/components-react';
  import { ControlBar } from '@livekit/components-react';
  
  // Custom hook to warn about missing styles - simplified version
  const useWarnAboutMissingStyles = () => {
    React.useEffect(() => {
      // Check if styles are loaded - simplified logic
      const hasStyles = document.querySelector('.lk-video-conference') !== null || 
                        document.styleSheets.length > 0;
      if (!hasStyles) {
        console.warn('LiveKit component styles might be missing. Make sure to import the CSS.');
      }
    }, []);
  };
  
  /**
   * @public
   */
  export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
    chatMessageFormatter?: MessageFormatter;
    // chatMessageEncoder?: MessageEncoder;
    // chatMessageDecoder?: MessageDecoder;
    /** @alpha */
    SettingsComponent?: React.ComponentType;
  }
  
  /**
   * The `VideoConference` ready-made component is your drop-in solution for a classic video conferencing application.
   * It provides functionality such as focusing on one participant, grid view with pagination to handle large numbers
   * of participants, basic non-persistent chat, screen sharing, and more.
   *
   * @remarks
   * The component is implemented with other LiveKit components like `FocusContextProvider`,
   * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
   * You can use these components as a starting point for your own custom video conferencing application.
   *
   * @example
   * ```tsx
   * <LiveKitRoom>
   *   <VideoConference />
   * <LiveKitRoom>
   * ```
   * @public
   */
  export function VideoConference({
    chatMessageFormatter,
    // chatMessageDecoder,
    // chatMessageEncoder,
    SettingsComponent,
    ...props
  }: VideoConferenceProps) {
    const [widgetState, setWidgetState] = React.useState<WidgetState>({
      showChat: false,
      unreadMessages: 0,
      showSettings: false,
    });
    // Use any type to avoid version conflicts
    const lastAutoFocusedScreenShareTrack = React.useRef<any>(null);
  
    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
      ],
      { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
    );
  
    const widgetUpdate = (state: WidgetState) => {
      log.debug('updating widget state', state);
      setWidgetState(state);
    };
  
    const layoutContext = useCreateLayoutContext();
  
    const screenShareTracks = tracks
      .filter(isTrackReference)
      .filter((track) => track.publication?.source === Track.Source.ScreenShare);
  
    const focusTrack = usePinnedTracks(layoutContext)?.[0];
    const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));
  
    React.useEffect(() => {
      // If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
      if (
        screenShareTracks.some((track) => track.publication?.isSubscribed) &&
        lastAutoFocusedScreenShareTrack.current === null
      ) {
        log.debug('Auto set screen share focus:', { newScreenShareTrack: screenShareTracks[0] });
        // Use unknown type to handle version conflicts
        const trackReference = screenShareTracks[0] as unknown as TrackReferenceOrPlaceholder;
        layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference });
        lastAutoFocusedScreenShareTrack.current = trackReference;
      } else if (
        lastAutoFocusedScreenShareTrack.current &&
        !screenShareTracks.some(
          (track) =>
            track.publication?.trackSid ===
            lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
        )
      ) {
        log.debug('Auto clearing screen share focus.');
        layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
        lastAutoFocusedScreenShareTrack.current = null;
      }
      if (focusTrack && !isTrackReference(focusTrack)) {
        // Use type-safe comparison with optional chaining to avoid type errors
        // Use unknown type to handle version conflicts
        const updatedFocusTrack = tracks.find(
          (tr) =>
            tr.participant?.identity === (focusTrack.participant as any)?.identity &&
            tr.source === focusTrack.source,
        );
        if (updatedFocusTrack !== focusTrack && isTrackReference(updatedFocusTrack)) {
          const trackReference = updatedFocusTrack as unknown as TrackReferenceOrPlaceholder;
          layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference });
        }
      }
    }, [
      screenShareTracks
        .map((ref) => `${ref.publication?.trackSid}_${ref.publication?.isSubscribed}`)
        .join(),
      focusTrack?.publication?.trackSid,
      tracks,
    ]);
  
    useWarnAboutMissingStyles();
  
    return (
      <div className="lk-video-conference" {...props}>
        {isWeb() && (
          <LayoutContextProvider
            value={layoutContext}
            onWidgetChange={widgetUpdate}
          >
            <div className="lk-video-conference-inner">
              {!focusTrack ? (
                <div className="lk-grid-layout-wrapper">
                  <GridLayout tracks={tracks}>
                    <ParticipantTile />
                  </GridLayout>
                </div>
              ) : (
                <div className="lk-focus-layout-wrapper">
                  <FocusLayoutContainer>
                    <CarouselLayout tracks={carouselTracks}>
                      <ParticipantTile />
                    </CarouselLayout>
                    {focusTrack && <FocusLayout trackRef={focusTrack as unknown as TrackReferenceOrPlaceholder} />}
                  </FocusLayoutContainer>
                </div>
              )}
              <ControlBar controls={{ chat: true, settings: !!SettingsComponent }} />
            </div>
            <Chat
              style={{ display: widgetState.showChat ? 'grid' : 'none' }}
              messageFormatter={chatMessageFormatter}
            //   messageEncoder={chatMessageEncoder}
            //   messageDecoder={chatMessageDecoder}
            />
            {SettingsComponent && (
              <div
                className="lk-settings-menu-modal"
                style={{ display: widgetState.showSettings ? 'block' : 'none' }}
              >
                <SettingsComponent />
              </div>
            )}
          </LayoutContextProvider>
        )}
        <RoomAudioRenderer />
        <ConnectionStateToast />
      </div>
    );
  }
  
  export default VideoConference;