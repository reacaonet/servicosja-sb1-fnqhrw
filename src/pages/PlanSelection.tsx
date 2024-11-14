import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PlanCard from '../components/PlanCard';
import AsaasCheckout from '../components/AsaasCheckout';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  active: boolean;
}

const PlanSelection: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const q = query(collection(db, 'plans'), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      const plansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Plan[];
      
      plansData.sort((a, b) => a.price - b.price);
      setPlans(plansData);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Login Necessário</h2>
          <p className="text-gray-600 mb-4">
            Você precisa estar logado para assinar um plano.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-xl text-gray-600">
            Destaque-se na plataforma e aumente suas oportunidades
          </p>
        </div>

        {error && (
          <div className="max-w-lg mx-auto mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {selectedPlan ? (
          <div className="max-w-2xl mx-auto">
            <AsaasCheckout plan={selectedPlan} />
            <button
              onClick={() => setSelectedPlan(null)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              ← Voltar para os planos
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={() => setSelectedPlan(plan)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSelection;