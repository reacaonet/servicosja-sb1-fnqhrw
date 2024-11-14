import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  alternativeText: string;
  alternativeLink: string;
  alternativeLinkText: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  alternativeText,
  alternativeLink,
  alternativeLinkText,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">{title}</h2>
        <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {alternativeText}{' '}
              <Link to={alternativeLink} className="font-medium text-blue-600 hover:text-blue-500">
                {alternativeLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;