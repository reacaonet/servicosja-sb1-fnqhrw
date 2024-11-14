import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface StripeCheckoutProps {
  plan: {
    id: string;
    name: string;
    price: number;
    description: string;
    priceId: string;
  };
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ plan }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubscribe = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: currentUser.uid,
          email: currentUser.email,
          planId: plan.id,
          planName: plan.name,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/plans`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Invalid checkout URL');
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError('Erro ao processar assinatura. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processando...</span>
          </>
        ) : (
          'Começar agora'
        )}
      </button>
    </div>
  );
};

export default StripeCheckout;