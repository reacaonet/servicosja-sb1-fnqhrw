import axios, { AxiosError } from 'axios';

const API_KEY = import.meta.env.VITE_ASAAS_API_KEY;
const API_URL = import.meta.env.VITE_ASAAS_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'access_token': API_KEY,
    'Content-Type': 'application/json'
  }
});

// Interceptor para tratar erros
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.data) {
      const asaasError = error.response.data as any;
      throw new Error(asaasError.errors?.[0]?.description || 'Erro ao processar requisição');
    }
    throw new Error('Erro de conexão com o servidor');
  }
);

export const createCustomer = async (
  name: string,
  email: string,
  cpfCnpj: string,
  phone?: string
) => {
  try {
    const response = await api.post('/customers', {
      name,
      email,
      cpfCnpj,
      phone,
      notificationDisabled: false
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao criar cliente');
  }
};

export const createSubscription = async (
  customerId: string,
  planName: string,
  value: number,
  nextDueDate: string,
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
) => {
  try {
    const response = await api.post('/subscriptions', {
      customer: customerId,
      billingType,
      value,
      nextDueDate,
      description: `Assinatura do plano ${planName}`,
      cycle: 'MONTHLY',
      maxPayments: 12
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao criar assinatura');
  }
};

export const getSubscription = async (subscriptionId: string) => {
  try {
    const response = await api.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao buscar assinatura');
  }
};