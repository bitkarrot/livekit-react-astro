import React from 'react';
import { LightningAddress } from '@getalby/lightning-tools';

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

        // TODO: below is an example of LNURL-verify from https://github.com/getAlby/js-lightning-tools
        // you can write your own polling function to check if your invoice has been paid
        // and then call the `setPaid` function.
        // const checkPaymentInterval = setInterval(async () => {
        //   const paid = await invoice.verifyPayment();

        //   if (paid && invoice.preimage) {
        //     setPaid({
        //       preimage: invoice.preimage,
        //     });
        //   }
        // }, 1000);

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
