import React from 'react';
import { Star, TrendingUp, Users, DollarSign } from 'lucide-react';

interface ProfessionalDashboardProps {
  userData: {
    name: string;
    email: string;
    profession: string;
    rating?: number;
    reviews?: number;
    [key: string]: any;
  };
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ userData }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bem-vindo, {userData.name}!</h2>
        <p className="text-gray-600 mt-2">Gerencie seus serviços e acompanhe seu desempenho.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Serviços Ativos</h3>
            <TrendingUp className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-green-900">Clientes</h3>
            <Users className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-yellow-900">Avaliação</h3>
            <Star className="text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {userData.rating?.toFixed(1) || '0.0'}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-purple-900">Ganhos</h3>
            <DollarSign className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600 mt-2">R$ 0</p>
        </div>
      </div>

      {/* Recent Services */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Serviços Recentes</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          <p>Você ainda não tem serviços agendados.</p>
          <p className="mt-2 text-sm">Complete seu perfil para aumentar suas chances de contratação.</p>
        </div>
      </div>

      {/* Profile Completion */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Perfil Profissional</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">{userData.profession}</h4>
              <p className="text-sm text-gray-600">{userData.location}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{userData.rating || '0.0'}</span>
              <span className="text-sm text-gray-500">
                ({userData.reviews || '0'} avaliações)
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completude do perfil</span>
                <span className="text-blue-600 font-medium">70%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Completar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;