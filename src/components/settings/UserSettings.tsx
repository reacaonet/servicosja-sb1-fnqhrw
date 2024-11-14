import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserSettings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600 mt-1">
          Para editar suas informações, acesse seu perfil
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate('/principal/profile')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir para Perfil
        </button>
      </div>
    </div>
  );
};

export default UserSettings;