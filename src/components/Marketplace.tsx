import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Filter, LogOut } from 'lucide-react';
import ServiceCard from './ServiceCard';
import CategoryButton from './CategoryButton';
import { ServiceProvider } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'professionals'));
        const providersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ServiceProvider[];
        setProviders(providersData);
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };

    fetchProviders();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const categories = [
    { id: 'all', name: 'Todos', icon: Briefcase },
    { id: 'construction', name: 'Pedreiros' },
    { id: 'electrical', name: 'Eletricistas' },
    { id: 'mechanical', name: 'Mecânicos' },
    { id: 'cleaning', name: 'Limpeza' },
    { id: 'domestic', name: 'Domésticas' },
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.profession.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">ServiçosJá</h1>
            <p className="text-blue-100">Encontre os melhores profissionais para seu serviço</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por profissional ou serviço..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter size={20} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
          {categories.map(category => (
            <CategoryButton
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </div>

        {/* Service Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(provider => (
            <ServiceCard key={provider.id} provider={provider} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;