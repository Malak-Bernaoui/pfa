import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Tableau de bord</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Déconnexion
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Bienvenue, {user?.name}           </h2>
          <p className="text-gray-600">
            Ceci est votre tableau de bord par défaut. Aucun rôle spécifique n’a été attribué.
          </p>
        </div>
      </div>
    </div>
  );
}