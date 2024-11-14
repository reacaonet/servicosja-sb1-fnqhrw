import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PlanCard from '../components/PlanCard';
import PaymentForm from '../components/PaymentForm';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  active: boolean;
}

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'plans'));
      const plansData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(plan => plan.active) as Plan[];
      setPlans(plansData);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setShowPaymentForm(true);
    }
  };

  const handlePaymentSuccess = () => {
    // Aqui você pode adicionar lógica adicional após o pagamento
    alert('Assinatura realizada com sucesso!');
    setShowPaymentForm(false);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Faça login para ver os planos disponíveis</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Escolha o plano ideal para você
          </h1>
          <p className="text-gray-600 mt-2">
            Comece a receber propostas de clientes hoje mesmo
          </p>
        </div>

        {error && (
          <div className="max-w-lg mx-auto mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : showPaymentForm && selectedPlan ? (
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Finalizar assinatura do plano {selectedPlan.name}
            </h2>
            <PaymentForm
              planId={selectedPlan.id}
              planName={selectedPlan.name}
              planPrice={selectedPlan.price}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
            <button
              onClick={() => setShowPaymentForm(false)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              ← Voltar para os planos
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handlePlanSelect}
                isSelected={selectedPlan?.id === plan.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansPage;