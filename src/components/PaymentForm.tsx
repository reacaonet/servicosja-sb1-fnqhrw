import React, { useState } from 'react';
import { createCustomer, createSubscription } from '../services/asaas';

interface PaymentFormProps {
  planId: string;
  planName: string;
  planPrice: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  planId,
  planName,
  planPrice,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    paymentMethod: 'CREDIT_CARD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customer = await createCustomer(
        formData.name,
        formData.email,
        formData.cpfCnpj
      );

      const nextDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      await createSubscription(
        customer.id,
        planName,
        planPrice,
        nextDueDate,
        formData.paymentMethod
      );

      onSuccess();
    } catch (error) {
      console.error('Error processing payment:', error);
      onError('Erro ao processar pagamento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <input
          type="text"
          id="name"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700">
          CPF/CNPJ
        </label>
        <input
          type="text"
          id="cpfCnpj"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
          value={formData.cpfCnpj}
          onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Forma de Pagamento
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="CREDIT_CARD"
              checked={formData.paymentMethod === 'CREDIT_CARD'}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Cartão de Crédito</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="BOLETO"
              checked={formData.paymentMethod === 'BOLETO'}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Boleto Bancário</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="PIX"
              checked={formData.paymentMethod === 'PIX'}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2">PIX</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Processando...' : 'Finalizar Assinatura'}
      </button>
    </form>
  );
};

export default PaymentForm;