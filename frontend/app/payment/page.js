'use client';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Payment() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handlePayment = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get Stripe publishable key from backend
      const configRes = await fetch('http://localhost:5135/api/payment/config');
      const { publishableKey } = await configRes.json();
      
      const stripe = await loadStripe(publishableKey);
      
      // Create checkout session
      const res = await fetch('http://localhost:5135/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      const { url } = await res.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto' }}>
        <h1>Pay $1 Registration Fee</h1>
        <p>Please login first.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <h1>Pay $1 Registration Fee</h1>
      <p>Complete your registration by paying the $1 fee.</p>
      <button 
        onClick={handlePayment}
        disabled={loading}
        style={{ 
          width: '100%', 
          padding: '15px', 
          fontSize: '16px',
          backgroundColor: '#635BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Redirecting...' : 'Pay with Stripe'}
      </button>
    </div>
  );
}
