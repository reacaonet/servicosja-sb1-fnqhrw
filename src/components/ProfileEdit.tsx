import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ServiceProvider } from '../types';
import { User, MapPin, Briefcase, DollarSign, Save, X, Upload, Phone } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ProfileEditProps {
  profile: ServiceProvider;
  onCancel: () => void;
  onSuccess: (updatedProfile: ServiceProvider) => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    profession: profile.profession,
    location: profile.location,
    hourlyRate: profile.hourlyRate || 0,
    imageUrl: profile.imageUrl || '',
    category: profile.category || '',
    phone: profile.phone || ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().name
          }))
          .filter(category => category.name);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Erro ao carregar categorias');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' 
      ? parseFloat(e.target.value) 
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [e.target.id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const docRef = doc(db, 'professionals', profile.id.toString());
      await updateDoc(docRef, formData);
      onSuccess({ ...profile, ...formData });
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Editar Perfil</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex-shrink-0">
            {formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt={formData.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                <User size={48} className="text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                URL da Imagem de Perfil
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Insira a URL de uma imagem online para seu perfil
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome completo
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              type="text"
              required
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phone"
              type="tel"
              required
              placeholder="(00) 00000-0000"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
            Profissão
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="profession"
              type="text"
              required
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.profession}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <div className="mt-1">
            <select
              id="category"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Localização
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="location"
              type="text"
              required
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
            Valor por hora (R$)
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              required
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.hourlyRate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;