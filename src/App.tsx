import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import Marketplace from './components/Marketplace';
import Home from './pages/Home';
import Principal from './pages/Principal';
import Profile from './pages/Profile';
import ContactsList from './components/dashboard/ContactsList';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Messages from './pages/Messages';
import Plans from './pages/Plans';
import PlanSelection from './pages/PlanSelection';
import ProfessionalDetails from './pages/ProfessionalDetails';
import Contact from './pages/Contact';
import Search from './pages/Search';
import Header from './components/Header';
import Footer from './components/Footer';
import ExpiredPlan from './pages/ExpiredPlan';
import PrivateRoute from './components/PrivateRoute';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthForm />} />
              <Route path="/register" element={<AuthForm isRegister />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/search" element={<Search />} />
              <Route path="/plans" element={<PlanSelection />} />
              <Route path="/expired-plan" element={<ExpiredPlan />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/professional/:id" element={<ProfessionalDetails />} />
              <Route
                path="/principal"
                element={
                  <PrivateRoute>
                    <Principal />
                  </PrivateRoute>
                }
              >
                <Route path="profile" element={<Profile />} />
                <Route path="contacts" element={<ContactsList />} />
                <Route path="settings" element={<Settings />} />
                <Route path="categories" element={<Categories />} />
                <Route path="messages" element={<Messages />} />
                <Route path="messages/:professionalId" element={<Messages />} />
                <Route path="plans" element={<Plans />} />
                <Route index element={<Navigate to="profile" replace />} />
              </Route>
              <Route
                path="/marketplace"
                element={
                  <PrivateRoute>
                    <Marketplace />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;