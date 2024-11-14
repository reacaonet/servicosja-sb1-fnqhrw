import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, Navigate } from 'react-router-dom';
import { LogOut, Home, User, Calendar, MessageSquare, Settings, Users, Briefcase, FolderTree, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface UserData {
  userType: 'client' | 'professional' | 'admin';
  name: string;
  email: string;
}

const Principal: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          setError('Usuário não encontrado');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Erro ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-gray-800">{error}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-600 mb-4">⚠️</div>
          <p className="text-gray-800">Dados do usuário não encontrados</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ServiçosJá</h1>
            <p className="text-sm text-blue-100">
              {userData.userType === 'admin' ? 'Administrador' : 
               userData.userType === 'professional' ? 'Área do Profissional' : 
               'Área do Cliente'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Home size={20} />
              <span>Início</span>
            </Link>
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

      {/* Sidebar and Content */}
      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/principal/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <User size={20} />
                  <span>Perfil</span>
                </Link>
              </li>

              {userData.userType === 'professional' && (
                <>
                  <li>
                    <Link
                      to="/principal/contacts"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Users size={20} />
                      <span>Propostas Recebidas</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/principal/agenda"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Calendar size={20} />
                      <span>Agenda</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/plans"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <CreditCard size={20} />
                      <span>Meu Plano</span>
                    </Link>
                  </li>
                </>
              )}

              {userData.userType === 'admin' && (
                <>
                  <li>
                    <Link
                      to="/principal/categories"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FolderTree size={20} />
                      <span>Categorias</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/principal/plans"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <CreditCard size={20} />
                      <span>Gerenciar Planos</span>
                    </Link>
                  </li>
                </>
              )}

              <li>
                <Link
                  to="/principal/messages"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <MessageSquare size={20} />
                  <span>Mensagens</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/principal/settings"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Settings size={20} />
                  <span>Configurações</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Outlet context={{ userType: userData.userType }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Principal;