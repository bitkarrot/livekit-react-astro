//import * as React from 'react';
import React from 'react';
import type { Participant } from 'livekit-client';
import { Track } from 'livekit-client';
import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { isTrackReference, isTrackReferencePinned } from '@livekit/components-core';
import { ConnectionQualityIndicator } from '@livekit/components-react';
import { ParticipantName } from '@livekit/components-react';
import { TrackMutedIndicator } from '@livekit/components-react';
import {
  ParticipantContext,
  TrackRefContext,
  useEnsureTrackRef,
  useFeatureContext,
  useMaybeLayoutContext,
  useMaybeParticipantContext,
  useMaybeTrackRefContext,
} from '@livekit/components-react';

import { FocusToggle } from '@livekit/components-react';
import { LockLockedIcon, ScreenShareIcon } from '@livekit/components-react';
import { VideoTrack } from '@livekit/components-react';
import { AudioTrack } from '@livekit/components-react';
import { useParticipantTile } from '@livekit/components-react';
import { useIsEncrypted } from '@livekit/components-react';

import ParticipantPlaceholder from '~/assets/images/ParticipantPlaceholder';

/**
 * The `ParticipantContextIfNeeded` component only creates a `ParticipantContext`
 * if there is no `ParticipantContext` already.
 * @example
 * ```tsx
 * <ParticipantContextIfNeeded participant={trackReference.participant}>
 *  ...
 * </ParticipantContextIfNeeded>
 * ```
 * @public
 */
export function ParticipantContextIfNeeded(
  props: React.PropsWithChildren<{
    participant?: Participant;
  }>,
) {
  const hasContext = !!useMaybeParticipantContext();
  return props.participant && !hasContext ? (
    <ParticipantContext.Provider value={props.participant}>
      {props.children}
    </ParticipantContext.Provider>
  ) : (
    <>{props.children}</>
  );
}

/**
 * Only create a `TrackRefContext` if there is no `TrackRefContext` already.
 * @internal
 */
export function TrackRefContextIfNeeded(
  props: React.PropsWithChildren<{
    trackRef?: TrackReferenceOrPlaceholder;
  }>,
) {
  const hasContext = !!useMaybeTrackRefContext();
  return props.trackRef && !hasContext ? (
    <TrackRefContext.Provider value={props.trackRef}>{props.children}</TrackRefContext.Provider>
  ) : (
    <>{props.children}</>
  );
}

/** @public */
export interface ParticipantTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The track reference to display. */
  trackRef?: TrackReferenceOrPlaceholder;
  disableSpeakingIndicator?: boolean;

  onParticipantClick?: (event: ParticipantClickEvent) => void;
}

/**
 * This is a customized version of the ParticipantTile component.
 *
 * The `ParticipantTile` component is the base utility wrapper for displaying a visual representation of a participant.
 * This component can be used as a child of the `TrackLoop` component or by passing a track reference as property.
 *
 * @example Using the `ParticipantTile` component with a track reference:
 * ```tsx
 * <ParticipantTile trackRef={trackRef} />
 * ```
 * @example Using the `ParticipantTile` component as a child of the `TrackLoop` component:
 * ```tsx
 * <TrackLoop>
 *  <ParticipantTile />
 * </TrackLoop>
 * ```
 * @public
 */
export const CustomParticipantTile: (
  props: ParticipantTileProps & React.RefAttributes<HTMLDivElement>,
) => React.ReactNode = /* @__PURE__ */ React.forwardRef<HTMLDivElement, ParticipantTileProps>(
  function ParticipantTile(
    {
      trackRef,
      children,
      onParticipantClick,
      disableSpeakingIndicator,
      ...htmlProps
    }: ParticipantTileProps,
    ref,
  ) {
    const trackReference = useEnsureTrackRef(trackRef);

    const { elementProps } = useParticipantTile<HTMLDivElement>({
      htmlProps,
      disableSpeakingIndicator,
      onParticipantClick,
      trackRef: trackReference,
    });
    const isEncrypted = useIsEncrypted(trackReference.participant);
    const layoutContext = useMaybeLayoutContext();

    const autoManageSubscription = useFeatureContext()?.autoSubscription;

    const handleSubscribe = React.useCallback(
      (subscribed: boolean) => {
        if (
          trackReference.source &&
          !subscribed &&
          layoutContext &&
          layoutContext.pin.dispatch &&
          isTrackReferencePinned(trackReference, layoutContext.pin.state)
        ) {
          layoutContext.pin.dispatch({ msg: 'clear_pin' });
        }
      },
      [trackReference, layoutContext],
    );

    const nostrIcon = (npub: string) => {
      console.log('Nostr Button clicked!', npub);
    };

    const zapIcon = (lightningAddress: string) => {
      console.log('Clicked on Lightning Address!', lightningAddress);
    };

    return (
      <div ref={ref} style={{ position: 'relative' }} {...elementProps}>
        <TrackRefContextIfNeeded trackRef={trackReference}>
          <ParticipantContextIfNeeded participant={trackReference.participant}>
            {children ?? (
              <>
                {isTrackReference(trackReference) &&
                (trackReference.publication?.kind === 'video' ||
                  trackReference.source === Track.Source.Camera ||
                  trackReference.source === Track.Source.ScreenShare) ? (
                  <VideoTrack
                    trackRef={trackReference}
                    onSubscriptionStatusChanged={handleSubscribe}
                    manageSubscription={autoManageSubscription}
                  />
                ) : (
                  isTrackReference(trackReference) && (
                    <AudioTrack
                      trackRef={trackReference}
                      onSubscriptionStatusChanged={handleSubscribe}
                    />
                  )
                )}
                <div className="lk-participant-placeholder">
                {/* <ParticipantPlaceholder /> */}
                  {trackReference.participant.attributes?.avatar_url &&
                  <img src={trackReference.participant.attributes?.avatar_url} width="50%" height="50%" className="rounded-full object-cover border-2 border-gray-300"  alt="avatar" />}
                </div>
                <div className="lk-participant-metadata">
                  <div className="lk-participant-metadata-item">
                    {trackReference.source === Track.Source.Camera ? (
                      <>
                        {isEncrypted && <LockLockedIcon style={{ marginRight: '0.25rem' }} />}
                        <TrackMutedIndicator
                          trackRef={{
                            participant: trackReference.participant,
                            source: Track.Source.Microphone,
                          }}
                          show={'muted'}
                        ></TrackMutedIndicator>                        
                          {trackReference.participant.attributes?.moderator && '⭐️'}
                          &nbsp;
                          {trackReference.participant.attributes?.petname} {/* truncate if longer than 15 */}
                          &nbsp;
                          <button
                          className="flex items-center justify-center w-7 h-7 rounded-full text-3xl hover:bg-white focus:outline-none"
                          onClick={() => nostrIcon(trackReference.participant.attributes?.npub)}>
                            <img src="/nostr.png" width="30" height="30" alt="nostr" /></button>
                          &nbsp;
                          <button className="flex items-center justify-center w-7 h-7 bg-yellow-400 rounded-full text-3xl hover:bg-white
                          focus:outline-none shadow-md hover:shadow-2xl transition duration-200"
                          onClick={() => zapIcon(trackReference.participant.attributes?.lightning_address)}>
                            {trackReference.participant.attributes?.lightning_address && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="#111" strokeWidth="0.5" viewBox="0 0 24 24" className="h-5 w-5">
                                <path d="M13 2L3 14h8l-1 8 10-12h-8z" />
                              </svg>
                            )}
                          </button>
                          {/* <ParticipantName/> */}
                      </>
                    ) : (
                      <>
                        <ScreenShareIcon style={{ marginRight: '0.25rem' }} />                        
                        <ParticipantName>&apos;s screen </ParticipantName>
                      </>
                    )}
                  </div>
                  <ConnectionQualityIndicator className="lk-participant-metadata-item" />
                </div>
              </>
            )}
            <FocusToggle trackRef={trackReference} />
          </ParticipantContextIfNeeded>
        </TrackRefContextIfNeeded>
      </div>
    );
  },
);
