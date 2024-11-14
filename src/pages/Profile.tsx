import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ProfileView from '../components/ProfileView';
import ProfileEdit from '../components/ProfileEdit';
import PasswordChange from '../components/PasswordChange';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.uid) {
        const docRef = doc(db, 'professionals', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        }
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (!profile) {
    return <div>Carregando...</div>;
  }

  if (isEditing) {
    return (
      <ProfileEdit
        profile={profile}
        onCancel={() => setIsEditing(false)}
        onSuccess={(updatedProfile) => {
          setProfile(updatedProfile);
          setIsEditing(false);
        }}
      />
    );
  }

  if (isChangingPassword) {
    return (
      <PasswordChange
        onCancel={() => setIsChangingPassword(false)}
        onSuccess={() => setIsChangingPassword(false)}
      />
    );
  }

  return (
    <ProfileView
      profile={profile}
      onEdit={() => setIsEditing(true)}
      onChangePassword={() => setIsChangingPassword(true)}
    />
  );
};

export default Profile;