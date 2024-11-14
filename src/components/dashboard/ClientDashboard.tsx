import React from 'react';
import { Star } from 'lucide-react';

interface ClientDashboardProps {
  userData: {
    name: string;
    email: string;
    [key: string]: any;
  };
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userData }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bem-vindo, {userData.name}!</h2>
        <p className="text-gray-600 mt-2">Gerencie seus serviços e encontre profissionais.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">Serviços Agendados</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">Serviços Concluídos</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900">Profissionais Favoritos</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
        </div>
      </div>

      {/* Recent Services */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Serviços Recentes</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          <p>Você ainda não tem serviços agendados.</p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Encontrar Profissionais
          </button>
        </div>
      </div>

      {/* Recommended Professionals */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Profissionais Recomendados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((_, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={`https://source.unsplash.com/random/100x100?professional&${index}`}
                alt="Professional"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-semibold">Nome do Profissional</h4>
                <p className="text-sm text-gray-600">Profissão</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-600">4.8 (120 avaliações)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;