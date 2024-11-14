import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createCustomer, createSubscription } from '../services/asaas';
import { CreditCard, Loader2 } from 'lucide-react';
import { maskCPF, maskPhone } from '../utils/masks';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface AsaasCheckoutProps {
  plan: Plan;
}

const AsaasCheckout: React.FC<AsaasCheckoutProps> = ({ plan }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cpfCnpj: '',
    phone: '',
    paymentMethod: 'CREDIT_CARD' as 'CREDIT_CARD' | 'BOLETO' | 'PIX'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    if (id === 'cpfCnpj') {
      formattedValue = maskCPF(value);
    } else if (id === 'phone') {
      formattedValue = maskPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [id]: formattedValue
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    
    const cpf = formData.cpfCnpj.replace(/\D/g, '');
    if (cpf.length !== 11) {
      setError('CPF inválido');
      return false;
    }

    const phone = formData.phone.replace(/\D/g, '');
    if (phone.length < 10) {
      setError('Telefone inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) {
      setError('Usuário não autenticado');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Criar cliente no Asaas
      const customer = await createCustomer(
        formData.name,
        currentUser.email,
        formData.cpfCnpj.replace(/\D/g, ''),
        formData.phone.replace(/\D/g, '')
      );

      if (!customer?.id) {
        throw new Error('Erro ao criar cliente no Asaas');
      }

      // Calcular próxima data de vencimento (amanhã)
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 1);

      // Criar assinatura
      const subscription = await createSubscription(
        customer.id,
        plan.name,
        plan.price,
        nextDueDate.toISOString().split('T')[0],
        formData.paymentMethod
      );

      if (!subscription?.id) {
        throw new Error('Erro ao criar assinatura no Asaas');
      }

      // Atualizar status da assinatura no Firestore
      await updateDoc(doc(db, 'professionals', currentUser.uid), {
        subscriptionStatus: {
          active: true,
          asaasCustomerId: customer.id,
          asaasSubscriptionId: subscription.id,
          planId: plan.id,
          planName: plan.name,
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: nextDueDate.toISOString(),
          paymentMethod: formData.paymentMethod
        }
      });

      // Redirecionar para URL de pagamento se fornecida
      if (subscription.paymentLink) {
        window.location.href = subscription.paymentLink;
      } else {
        navigate('/payment-success');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao processar pagamento. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Finalizar Assinatura</h3>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Resumo do Plano</h4>
        <p className="text-gray-600">{plan.name}</p>
        <p className="text-lg font-semibold text-gray-900 mt-2">
          R$ {plan.price.toFixed(2)}/mês
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            id="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={formData.name}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <input
            type="text"
            id="cpfCnpj"
            required
            maxLength={14}
            placeholder="000.000.000-00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={formData.cpfCnpj}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            id="phone"
            required
            maxLength={15}
            placeholder="(00) 00000-0000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forma de Pagamento
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CREDIT_CARD' }))}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                formData.paymentMethod === 'CREDIT_CARD'
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={20} />
              <span>Cartão</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'BOLETO' }))}
              disabled={loading}
              className={`px-4 py-2 rounded-lg border ${
                formData.paymentMethod === 'BOLETO'
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Boleto
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'PIX' }))}
              disabled={loading}
              className={`px-4 py-2 rounded-lg border ${
                formData.paymentMethod === 'PIX'
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              PIX
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Finalizar Assinatura</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AsaasCheckout;