import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard } from 'lucide-react';

const ExpiredPlan: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Plano Expirado
        </h1>
        
        <p className="text-gray-600 mb-8">
          Seu plano expirou. Para continuar utilizando todos os recursos da plataforma, 
          escolha um novo plano e mantenha sua assinatura ativa.
        </p>

        <button
          onClick={() => navigate('/plans')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          <span>Escolher Novo Plano</span>
        </button>
      </div>
    </div>
  );
};

export default ExpiredPlan;