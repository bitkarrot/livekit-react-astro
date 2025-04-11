// src/lib/nostrUtils.ts
import { SimplePool, type Event } from 'nostr-tools';

// Default Nostr relays
const defaultRelays = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol',
];

/**
 * Fetches the lightning address (lud16 or lud06) for a given pubkey from Nostr relays.
 * @param pubkey The Nostr public key to query.
 * @returns A promise resolving to the lightning address or an empty string if not found.
 */
export const fetchLightningAddress = async (pubkey: string): Promise<string> => {
  const pool = new SimplePool();

  try {
    // Promise to handle event, end of stream, or timeout
    const eventPromise = new Promise<string>((resolve) => {
      const sub = pool.subscribeMany(
        defaultRelays,
        [
          {
            kinds: [0],
            authors: [pubkey],
          },
        ],
        {
          onevent(event: Event) {
            if (event.kind === 0 && event.pubkey === pubkey) {
              try {
                const content = JSON.parse(event.content);
                const lud = content.lud16 || content.lud06 || '';
                console.log(`Event content for ${pubkey}:`, content);
                if (lud) {
                  console.log(`Lightning address found: ${lud}`);
                  sub.close();
                  resolve(lud);
                }
              } catch (e) {
                console.error('Error parsing event content:', e);
              }
            }
          },
          oneose() {
            console.log('End of stored events for relays:', defaultRelays);
            sub.close();
            resolve('');
          },
          onclose() {
            console.log('Subscription closed for relays:', defaultRelays);
            resolve('');
          },
        }
      );
    });

    // Timeout for event fetching
    const fetchTimeout = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Event fetch timeout')), 10000)
    );

    const lightningAddress = await Promise.race([eventPromise, fetchTimeout]);

    // Clean up pool
    await pool.close(defaultRelays);

    return lightningAddress;
  } catch (e) {
    console.error('Error fetching lightning address:', e);
    // Ensure pool is closed even on error
    try {
      await pool.close(defaultRelays);
    } catch (closeError) {
      console.error('Error closing pool:', closeError);
    }
    return '';
  }
};