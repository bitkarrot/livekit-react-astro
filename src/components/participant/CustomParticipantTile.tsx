// CustomParticipantTile.tsx component in Astro for Livekit
import React, { useState } from 'react';
//import ReactDOM from 'react-dom';
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

import { LightningAddress } from '@getalby/lightning-tools';

import NostrPlaceholder from '~/assets/images/NostrPlaceholder';

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
  onZapIconClick?: (address: string) => void;
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
  props: ParticipantTileProps & React.RefAttributes<HTMLDivElement> & { children?: React.ReactNode },
) => React.ReactNode = /* @__PURE__ */ React.forwardRef<HTMLDivElement, ParticipantTileProps & { children?: React.ReactNode }>(
  function ParticipantTile(
    props: ParticipantTileProps & { children?: React.ReactNode },
    ref: React.Ref<HTMLDivElement>,
  ) {
    const {
      trackRef,
      disableSpeakingIndicator,
      onParticipantClick,
      onZapIconClick,
      children,
      ...htmlProps
    } = props;

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

    const zapIcon = (lightningAddress: string) => {
      console.log('Clicked on Lightning Address!', lightningAddress);
      if (onZapIconClick) {
        onZapIconClick(lightningAddress);
      } else {
        console.log('Zap icon clicked, but no callback provided', lightningAddress);
      }
    };

    const truncatePetName = (petname: string) => {
      if (petname && petname.length > 15) {
        return petname.substring(0, 15) + '...';
      }
      return petname;
    };

    const isOwner = trackReference.participant.attributes?.owner;
    const isModerator = trackReference.participant.attributes?.moderator;

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedNpub, setSelectedNpub] = useState<string | null>(null);

    const handleNpubClick = (npub: string) => {
      setSelectedNpub(npub);
      setIsDrawerOpen(true);
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
                  {trackReference.participant.attributes?.avatar_url ?
                  <img src={trackReference.participant.attributes?.avatar_url} width="50%" height="50%" className="rounded-full object-cover border-2 border-gray-300"  alt="avatar" />
                  : <NostrPlaceholder />}
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
                            { isOwner === 'true' ? (
                              '👑' // Show crown if the user is the owner
                            ) : isModerator === 'true' ? (
                              '⭐️' // Show star if the user is a moderator but not the owner
                            ) : ''}
                          &nbsp;
                          {trackReference.participant.attributes?.npub ? (
                            <button
                              onClick={() => handleNpubClick(trackReference.participant.attributes.npub)}
                              className="hover:underline hover:text-yellow-500 text-left"
                            >
                              {truncatePetName(trackReference.participant.attributes?.petname)}
                            </button>
                          ) : (
                            truncatePetName(trackReference.participant.attributes?.petname) || ''
                          )}
                          &nbsp;
                          {trackReference.participant.attributes?.lightning_address && (
                            <button
                              className="flex items-center justify-center w-7 h-7 bg-purple-600 rounded-full text-3xl hover:bg-yellow-500 focus:outline-none shadow-md hover:shadow-2xl transition duration-200"
                              onClick={() => zapIcon(trackReference.participant.attributes.lightning_address)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="#fff"
                                stroke="#ccc"
                                strokeWidth="0.5"
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                              >
                                <path d="M13 2L3 14h8l-1 8 10-12h-8z" />
                              </svg>
                            </button>
                          )}
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

        {/* Side Drawer for njump.me embed */}
        {isDrawerOpen && selectedNpub && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDrawerOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-96 bg-black bg-opacity-80 shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="p-4">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-white hover:text-gray-300 mb-4"
                >
                  Close
                </button>
                <div className="overflow-y-auto h-[calc(100vh-60px)]">
                  <iframe
                    src={`https://njump.me/${selectedNpub}`}
                    title="Njump Embed"
                    className="w-full h-[calc(100vh-60px)] border-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export const ZapPaymentModal = ({ lightningAddress, onClose }: { lightningAddress: string; onClose: () => void }) => {
  const [amount, setAmount] = React.useState('100');
  const [comment, setComment] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountValue = parseInt(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    try {
      const ln = new LightningAddress(lightningAddress);
      await ln.fetch();

      if (!ln.nostrPubkey) {
        throw new Error("Failed to fetch Nostr pubkey for zap");
      }

      let content = comment.trim();
      if (content.length > 0) {
        content = content.substring(0, 200);
      }

      console.log("Requesting invoice for", amountValue, "sats with comment:", content);
      const invoice = await ln.requestInvoice({ satoshi: amountValue });

      // Dynamically import the bitcoin-connect library only on client side
      if (typeof window !== 'undefined') {
        const { launchPaymentModal } = await import('@getalby/bitcoin-connect-react');
        // Check if bc-modal already exists in the DOM
        const existingModal = document.querySelector('#bc-modal');
        if (existingModal) {
          console.log('bc-modal already in DOM, skipping modal creation');
          alert('Payment modal is already open. Please close it before starting a new payment.');
          return;
        }
        const { setPaid } = launchPaymentModal({
          invoice: invoice.paymentRequest,
          onPaid: ({ preimage }) => {
            alert(
              `Paid to: ${lightningAddress}, amount: ${amountValue} sats, preimage: ${preimage}`,
            );
            onClose();
          },
          onCancelled: () => {
            alert("Payment cancelled");
            onClose();
          },
        });
      } else {
        // Fallback for SSR or non-browser environments
        alert("Payment modal is only available in browser. Invoice: " + invoice.paymentRequest);
        onClose();
      }
    } catch (err) {
      console.error("Error in zap payment:", err);
      if (err instanceof Error) {
        setError(`Failed to process donation: ${err.message}`);
      } else {
        setError("Failed to process donation: Unknown error");
      }
    }
  };

  return (
    <div className="lk-settings-menu-modal" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'var(--lk-bg-secondary)',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      minWidth: '300px',
      color: 'white'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Send Zap to {lightningAddress}</h3>
      {error && (
        <div style={{
          color: 'red',
          marginBottom: '1rem',
          fontSize: '0.9em'
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="amount" style={{ display: 'block', marginBottom: '0.5rem' }}>Amount (sats):</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
            required
            min="1"
          />
        </div>
        <div>
          <label htmlFor="comment" style={{ display: 'block', marginBottom: '0.5rem' }}>Comment (optional):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              minHeight: '10px'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              backgroundColor: '#9333EA', // bg-purple-600
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Send Zap
          </button>
        </div>
      </form>
    </div>
  );
};
