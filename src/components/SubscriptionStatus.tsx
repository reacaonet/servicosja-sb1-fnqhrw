import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ServiceProvider } from '../types';

interface SubscriptionStatusProps {
  provider: ServiceProvider;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ provider }) => {
  const navigate = useNavigate();
  const status = provider.subscriptionStatus;

  if (!status) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Assinatura Pendente</h3>
            <p className="mt-1 text-sm text-yellow-700">
              Você ainda não possui um plano ativo. Escolha um plano para começar a oferecer seus serviços.
            </p>
            <button
              onClick={() => navigate('/plans')}
              className="mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              Escolher Plano →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const endDate = new Date(status.currentPeriodEnd);
  const isExpired = endDate < new Date();

  if (isExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Assinatura Expirada</h3>
            <p className="mt-1 text-sm text-red-700">
              Sua assinatura expirou em {endDate.toLocaleDateString()}. Renove agora para continuar oferecendo seus serviços.
            </p>
            <button
              onClick={() => navigate('/plans')}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Renovar Assinatura →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-green-800">Assinatura Ativa</h3>
          <p className="mt-1 text-sm text-green-700">
            Seu plano está ativo até {endDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;