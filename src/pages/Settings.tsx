import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminSettings from '../components/settings/AdminSettings';
import UserSettings from '../components/settings/UserSettings';

interface ContextType {
  userType: 'client' | 'professional' | 'admin';
}

const Settings: React.FC = () => {
  const { userType } = useOutletContext<ContextType>();

  return (
    <div>
      {userType === 'admin' ? <AdminSettings /> : <UserSettings />}
    </div>
  );
};

export default Settings;