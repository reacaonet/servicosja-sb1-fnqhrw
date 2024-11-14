import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Star, MapPin, ChevronRight, FileText, Users, CheckCircle } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ServiceCard from '../components/ServiceCard';
import { CategoryButton } from '../components/CategoryButton';
import { ServiceProvider } from '../types';

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'Todos os serviços', description: '', imageUrl: '', featured: false, active: true, createdAt: '', updatedAt: '' }
  ]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesSnapshot, providersSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'categories'), 
            where('active', '==', true)
          )),
          getDocs(collection(db, 'professionals'))
        ]);

        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];

        setCategories([
          { id: 'all', name: 'Todos os serviços', description: '', imageUrl: '', featured: false, active: true, createdAt: '', updatedAt: '' },
          ...categoriesData
        ]);

        const providersData = providersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ServiceProvider[];
        setProviders(providersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.profession.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Encontre os melhores profissionais para seu serviço
            </h1>
            <p className="text-xl text-blue-100">
              Conectamos você aos melhores profissionais da sua região
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Qual serviço você precisa?"
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="container mx-auto px-4 -mt-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {categories.map(category => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Categorias Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories
              .filter(category => category.id !== 'all' && category.featured)
              .map((category) => (
                <Link
                  key={category.id}
                  to={`/search?category=${category.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Profissionais em Destaque</h2>
            <Link
              to="/search"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              Ver todos
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.slice(0, 6).map(provider => (
              <ServiceCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O que é o ServiçosJá?</h2>
            <p className="text-lg text-gray-600">
              ServiçosJá é a maior plataforma de contratação de serviços do Brasil. Conectamos Profissionais de todo o Brasil com pessoas solicitando serviço, atendendo com qualidade, facilidade e rapidez todos os tipos de necessidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Faça o seu pedido</h3>
              <p className="text-gray-600">
                Fale o que você precisa. É rápido e de graça!
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Receba até quatro orçamentos</h3>
              <p className="text-gray-600">
                Profissionais avaliados entram em contato com você em instantes!
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Escolha o melhor</h3>
              <p className="text-gray-600">
                Negocie direto com eles. Fácil como nunca foi antes!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;