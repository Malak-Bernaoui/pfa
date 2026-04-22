// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({ users: 0, enseignants: 0, etudiants: 0 });

  useEffect(() => {
    // Exemple d'appel API pour récupérer des statistiques
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats'); // À créer dans votre backend
        setStats(res.data);
      } catch (error) {
        console.error('Erreur chargement stats', error);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Administration</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Déconnexion
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Bonjour, {user?.name} (Admin)
          </h2>
          <p className="text-gray-600 mt-2">Gérez l’ensemble de la plateforme.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700">Utilisateurs</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.users}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700">Enseignants</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.enseignants}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700">Étudiants</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.etudiants}</p>
          </div>
        </div>
      </div>
    </div>
  );
}