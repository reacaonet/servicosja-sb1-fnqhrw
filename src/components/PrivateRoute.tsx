import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasValidPlan, setHasValidPlan] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();

        // Admins têm acesso irrestrito
        if (userData?.userType === 'admin') {
          setIsAdmin(true);
          setHasValidPlan(true);
          setLoading(false);
          return;
        }

        // Verificar assinatura apenas para profissionais
        if (userData?.userType === 'professional') {
          const professionalDoc = await getDoc(doc(db, 'professionals', currentUser.uid));
          const professionalData = professionalDoc.data();

          if (professionalData?.subscriptionStatus) {
            const currentPeriodEnd = new Date(professionalData.subscriptionStatus.currentPeriodEnd);
            setHasValidPlan(currentPeriodEnd > new Date());
          } else {
            setHasValidPlan(false);
          }
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        setHasValidPlan(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserAccess();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admins têm acesso irrestrito
  if (isAdmin) {
    return <>{children}</>;
  }

  // Permitir acesso à página de planos mesmo com assinatura expirada
  if (location.pathname === '/plans') {
    return <>{children}</>;
  }

  // Redirecionar para página de plano expirado se assinatura estiver inválida
  if (!hasValidPlan) {
    return <Navigate to="/expired-plan" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;