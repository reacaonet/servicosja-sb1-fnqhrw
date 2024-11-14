import React, { useState, useEffect } from 'react';
import { Settings, Users, Shield, Database, Briefcase } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'client' | 'professional' | 'admin';
  active?: boolean;
  createdAt?: string;
}

interface Professional extends User {
  profession: string;
  location: string;
  phone?: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  category?: string;
}

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [users, setUsers] = useState<User[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'professionals') {
      fetchProfessionals();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const professionalQuery = query(collection(db, 'users'), where('userType', '==', 'professional'));
      const professionalSnapshot = await getDocs(professionalQuery);
      
      const professionalsData = await Promise.all(
        professionalSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          const professionalDoc = await getDocs(
            query(collection(db, 'professionals'), where('email', '==', userData.email))
          );
          
          let professionalData = {};
          if (!professionalDoc.empty) {
            professionalData = professionalDoc.docs[0].data();
          }

          return {
            id: userDoc.id,
            ...userData,
            ...professionalData,
            rating: professionalData?.rating || 0,
            reviews: professionalData?.reviews || 0,
            hourlyRate: professionalData?.hourlyRate || 0
          };
        })
      );

      setProfessionals(professionalsData as Professional[]);
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { active });
      if (activeTab === 'users') {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, active } : user
        ));
      } else if (activeTab === 'professionals') {
        setProfessionals(professionals.map(prof => 
          prof.id === userId ? { ...prof, active } : prof
        ));
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Erro ao atualizar status do usuário');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações do Sistema</h2>

      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-4 ${
            activeTab === 'general'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings size={20} />
            <span>Geral</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span>Usuários</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('professionals')}
          className={`pb-4 px-4 ${
            activeTab === 'professionals'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase size={20} />
            <span>Profissionais</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-4 px-4 ${
            activeTab === 'security'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield size={20} />
            <span>Segurança</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-4 px-4 ${
            activeTab === 'database'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database size={20} />
            <span>Banco de Dados</span>
          </div>
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nome do Sistema
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                defaultValue="ServiçosJá"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                URL do Sistema
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                defaultValue="https://servicosja.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              defaultValue="Plataforma de contratação de serviços"
            />
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando usuários...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${user.userType === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.userType === 'professional' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'}`}>
                          {user.userType === 'admin' ? 'Administrador' :
                           user.userType === 'professional' ? 'Profissional' : 'Cliente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={user.active !== false}
                            onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => {/* Implement edit functionality */}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'professionals' && (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando profissionais...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avaliação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {professionals.map((professional) => (
                    <tr key={professional.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{professional.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{professional.profession}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{professional.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{professional.email}</div>
                        <div className="text-sm text-gray-500">{professional.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        R$ {professional.hourlyRate?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{professional.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-sm text-gray-500 ml-1">
                            ({professional.reviews || 0} avaliações)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={professional.active !== false}
                            onChange={(e) => handleStatusChange(professional.id, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => {/* Implement edit functionality */}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Política de Senha
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Exigir letras maiúsculas</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Exigir números</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Exigir caracteres especiais</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tempo de Sessão (minutos)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              defaultValue="30"
            />
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Salvar Configurações
            </button>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Status do Banco de Dados</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Conexões Ativas:</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tamanho do Banco:</span>
                <span className="font-medium">1.2 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Último Backup:</span>
                <span className="font-medium">2024-03-19 23:00</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Fazer Backup
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Restaurar Backup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;