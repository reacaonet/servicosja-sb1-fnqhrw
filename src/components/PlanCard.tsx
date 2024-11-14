import React from 'react';
import { Check } from 'lucide-react';

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
  };
  onSelect: (planId: string) => void;
  isSelected?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isSelected }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all ${
        isSelected ? 'border-blue-600 shadow-lg scale-105' : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-gray-500 mt-2">{plan.description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">R$ {plan.price.toFixed(2)}</span>
          <span className="text-gray-500">/mês</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {isSelected ? 'Plano Selecionado' : 'Selecionar Plano'}
      </button>
    </div>
  );
};

export default PlanCard;