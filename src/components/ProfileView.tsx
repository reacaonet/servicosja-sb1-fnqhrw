import React, { useState, useEffect } from 'react';
import { ServiceProvider } from '../types';
import { User, MapPin, Briefcase, Mail, Phone, Edit, Key, FolderTree } from 'lucide-react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileViewProps {
  profile: ServiceProvider;
  onEdit: () => void;
  onChangePassword: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onEdit, onChangePassword }) => {
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (profile.category) {
        try {
          const docRef = doc(db, 'categories', profile.category);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCategoryName(docSnap.data().name);
          }
        } catch (err) {
          console.error('Error fetching category:', err);
        }
      }
    };

    fetchCategoryName();
  }, [profile.category]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            <span>Editar Perfil</span>
          </button>
          <button
            onClick={onChangePassword}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Key size={18} />
            <span>Alterar Senha</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-shrink-0">
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="w-32 h-32 rounded-lg object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
              <User size={48} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <User className="w-5 h-5" />
            <span className="font-medium text-gray-900">{profile.name}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <Mail className="w-5 h-5" />
            <span>{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-5 h-5" />
              <span>{profile.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-600">
            <Briefcase className="w-5 h-5" />
            <span>{profile.profession}</span>
          </div>

          {categoryName && (
            <div className="flex items-center gap-3 text-gray-600">
              <FolderTree className="w-5 h-5" />
              <span>{categoryName}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{profile.location}</span>
          </div>

          {profile.hourlyRate > 0 && (
            <div className="flex items-center gap-3 text-gray-600">
              <span className="font-medium text-gray-900">
                R$ {profile.hourlyRate}/hora
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;