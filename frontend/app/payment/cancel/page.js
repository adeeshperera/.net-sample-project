'use client';
import { useRouter } from 'next/navigation';

export default function PaymentCancel() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', textAlign: 'center' }}>
      <h1>Payment Cancelled</h1>
      <p>You cancelled the payment. No charges were made.</p>
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
    </div>
  );
}
