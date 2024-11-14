import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const updateSubscription = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError('Sessão de pagamento não encontrada');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const { subscription } = await response.json();
        if (!subscription) {
          throw new Error('Subscription data not found');
        }

        // Update subscription status in Firestore
        const userRef = doc(db, 'professionals', currentUser.uid);
        await updateDoc(userRef, {
          subscriptionStatus: {
            active: true,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            planId: subscription.metadata.planId,
            planName: subscription.metadata.planName,
            priceId: subscription.items.data[0].price.id
          }
        });

        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/principal/profile');
        }, 2000);
      } catch (err) {
        console.error('Error updating subscription:', err);
        setError('Erro ao confirmar pagamento. Por favor, entre em contato com o suporte.');
      } finally {
        setLoading(false);
      }
    };

    updateSubscription();
  }, [currentUser, navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Processando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">×</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erro no Pagamento
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/plans')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento Confirmado!
        </h1>
        <p className="text-gray-600 mb-8">
          Sua assinatura foi ativada com sucesso. Você será redirecionado para o dashboard em instantes.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;