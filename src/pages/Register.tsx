import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import AuthLayout from '../components/AuthLayout';
import { Mail, Lock, User, Briefcase, MapPin, Phone } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profession: '',
    location: '',
    phone: '',
    userType: 'client'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      const userData = {
        name: formData.name,
        email: formData.email,
        userType: formData.userType,
        phone: formData.phone,
        createdAt: new Date().toISOString(),
      };

      // Salvar no users collection
      await setDoc(doc(db, 'users', user.uid), userData);

      // Se for profissional, salvar na collection professionals e redirecionar para seleção de plano
      if (formData.userType === 'professional') {
        await setDoc(doc(db, 'professionals', user.uid), {
          ...userData,
          profession: formData.profession,
          location: formData.location,
          rating: 0,
          reviews: 0,
          hourlyRate: 0,
          active: false // Será ativado após escolher um plano
        });
        navigate('/plans');
      } else {
        navigate('/principal/profile');
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    }
  };

  // ... resto do código do componente permanece igual
};