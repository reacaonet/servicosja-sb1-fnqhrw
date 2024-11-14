import React from 'react';
import { Star, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceProvider } from '../types';

interface ServiceCardProps {
  provider: ServiceProvider;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ provider }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/professional/${provider.id}`)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {provider.imageUrl ? (
          <img
            src={provider.imageUrl}
            alt={provider.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
            <User size={32} className="text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{provider.name}</h3>
          <p className="text-blue-600 font-medium">{provider.profession}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="font-medium">{provider.rating}</span>
            <span className="text-gray-500 text-sm">({provider.reviews} avaliações)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-gray-600">
        <MapPin size={16} />
        <span className="text-sm">{provider.location}</span>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Valor hora</span>
          <span className="font-semibold text-lg">R$ {provider.hourlyRate}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;