import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">ServiçosJá</h3>
            <p className="text-gray-400">
              Conectando você aos melhores profissionais da sua região.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter size={24} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Buscar Profissionais
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Cadastre-se
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Categorias</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/search?category=construction" className="hover:text-white transition-colors">
                  Construção
                </Link>
              </li>
              <li>
                <Link to="/search?category=electrical" className="hover:text-white transition-colors">
                  Elétrica
                </Link>
              </li>
              <li>
                <Link to="/search?category=cleaning" className="hover:text-white transition-colors">
                  Limpeza
                </Link>
              </li>
              <li>
                <Link to="/search?category=maintenance" className="hover:text-white transition-colors">
                  Manutenção
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <Phone className="text-blue-400" size={20} />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="text-blue-400" size={20} />
                <span>contato@servicosja.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="text-blue-400" size={20} />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} ServiçosJá. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;