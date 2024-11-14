import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import DashboardLayout from '../components/DashboardLayout';
import ClientDashboard from '../components/dashboard/ClientDashboard';
import ProfessionalDashboard from '../components/dashboard/ProfessionalDashboard';

interface UserData {
  id: string;
  name: string;
  email: string;
  userType: 'client' | 'professional';
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData({ id: docSnap.id, ...docSnap.data() } as UserData);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!currentUser || !userData) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <DashboardLayout userType={userData.userType}>
      {userData.userType === 'client' ? (
        <ClientDashboard userData={userData} />
      ) : (
        <ProfessionalDashboard userData={userData} />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;