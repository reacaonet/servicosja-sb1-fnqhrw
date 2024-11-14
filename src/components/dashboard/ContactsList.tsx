import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Calendar, Check, X, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  location: string;
  serviceDescription: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  budget?: number;
  category?: string;
}

const ContactsList: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.uid) {
      fetchProposals();
    }
  }, [currentUser]);

  const fetchProposals = async () => {
    try {
      const q = query(
        collection(db, 'proposals'),
        where('professionalId', '==', currentUser?.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const proposalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Proposal[];
      
      // Ordenar por data de criação manualmente
      proposalsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setProposals(proposalsData);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Erro ao carregar propostas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (proposalId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'proposals', proposalId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      setProposals(proposals.map(proposal =>
        proposal.id === proposalId
          ? { ...proposal, status: newStatus }
          : proposal
      ));
    } catch (err) {
      console.error('Error updating proposal:', err);
      setError('Erro ao atualizar status da proposta. Por favor, tente novamente.');
    }
  };

  const getStatusBadge = (status: Proposal['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'Pendente',
      accepted: 'Aceito',
      rejected: 'Recusado'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Propostas Recebidas</h2>
        <p className="text-gray-600 mt-1">Gerencie as solicitações de serviço dos clientes</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {proposals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Você ainda não recebeu nenhuma proposta.</p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="border rounded-lg p-6 space-y-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{proposal.clientName}</h3>
                  <p className="text-gray-600 mt-1">{proposal.serviceDescription}</p>
                </div>
                {getStatusBadge(proposal.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{proposal.clientEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{proposal.clientPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{proposal.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(proposal.date).toLocaleDateString()}</span>
                </div>
              </div>

              {proposal.budget && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-900">
                    Orçamento estimado: R$ {proposal.budget.toFixed(2)}
                  </span>
                </div>
              )}

              {proposal.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleStatusChange(proposal.id, 'accepted')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check size={20} />
                    <span>Aceitar Proposta</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(proposal.id, 'rejected')}
                    className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X size={20} />
                    <span>Recusar</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactsList;