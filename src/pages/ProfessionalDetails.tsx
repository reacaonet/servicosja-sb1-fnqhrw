import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ServiceProvider } from '../types';
import { Star, MapPin, Mail, Phone, MessageSquare, ArrowLeft, User } from 'lucide-react';

const ProfessionalDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'professionals', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProvider({ id: docSnap.id, ...docSnap.data() } as ServiceProvider);
        } else {
          setError('Profissional não encontrado');
        }
      } catch (err) {
        console.error('Error fetching professional:', err);
        setError('Erro ao carregar dados do profissional');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const handleContact = (type: 'whatsapp' | 'message' | 'email') => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!provider) return;

    switch (type) {
      case 'whatsapp':
        window.open(`https://wa.me/${provider.phone}?text=Olá, gostaria de contratar seus serviços!`);
        break;
      case 'message':
        navigate(`/principal/messages/${provider.id}`);
        break;
      case 'email':
        window.location.href = `mailto:${provider.email}?subject=Interesse em seus serviços`;
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-start gap-6">
              {provider.imageUrl ? (
                <img
                  src={provider.imageUrl}
                  alt={provider.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                <p className="text-xl text-blue-600 mt-1">{provider.profession}</p>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="font-medium">{provider.rating}</span>
                    <span className="text-gray-500">({provider.reviews} avaliações)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={20} />
                    <span>{provider.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  R$ {provider.hourlyRate}/hora
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <button
                onClick={() => handleContact('whatsapp')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone size={20} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleContact('message')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageSquare size={20} />
                <span>Mensagem</span>
              </button>

              <button
                onClick={() => handleContact('email')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Mail size={20} />
                <span>Email</span>
              </button>
            </div>

            {/* Adicione mais seções conforme necessário, como:
            - Descrição detalhada
            - Portfólio
            - Avaliações
            - Horários disponíveis
            etc. */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetails;