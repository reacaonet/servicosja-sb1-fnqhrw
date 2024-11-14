import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { LogOut, Home, User, Calendar, MessageSquare, Settings, Users } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'client' | 'professional';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {userType === 'client' ? 'Área do Cliente' : 'Área do Profissional'}
          </h1>
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
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <User size={20} />
                  <span>Perfil</span>
                </Link>
              </li>
              {userType === 'professional' && (
                <li>
                  <Link
                    to="/dashboard/contacts"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Users size={20} />
                    <span>Contatos</span>
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/dashboard/agenda"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Calendar size={20} />
                  <span>Agenda</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/mensagens"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <MessageSquare size={20} />
                  <span>Mensagens</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/configuracoes"
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;