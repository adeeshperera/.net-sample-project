'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        const res = await fetch('http://localhost:5135/api/payment/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        if (res.ok) {
          setStatus('success');
          // Update local storage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.hasPaid = true;
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', textAlign: 'center' }}>
      {status === 'verifying' && (
        <>
          <h1>Verifying Payment...</h1>
          <p>Please wait while we confirm your payment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 style={{ color: 'green' }}>✓ Payment Successful!</h1>
          <p>Thank you for your registration fee.</p>
          <button 
            onClick={() => router.push('/')}
            style={{ 
              padding: '10px 20px', 
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Go to Home
          </button>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 style={{ color: 'red' }}>Payment Verification Failed</h1>
          <p>There was an issue verifying your payment. Please contact support.</p>
          <button 
            onClick={() => router.push('/payment')}
            style={{ 
              padding: '10px 20px', 
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div style={{ maxWidth: '500px', margin: '50px auto', textAlign: 'center' }}><h1>Loading...</h1></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
