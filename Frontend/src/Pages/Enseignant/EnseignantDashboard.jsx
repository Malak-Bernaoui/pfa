import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Api/Api';

export default function EnseignantDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [enseignant, setEnseignant] = useState(null);
  const [cours, setCours] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les infos de l'enseignant (à créer dans votre backend)
        const resEnseignant = await api.get(`/enseignants/${id}`);
        setEnseignant(resEnseignant.data);
        // Récupérer ses cours
        const resCours = await api.get(`/enseignants/${id}/cours`);
        setCours(resCours.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

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

  if (!enseignant) return <div className="text-center mt-10">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Espace Enseignant</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Déconnexion
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {enseignant.nom} {enseignant.prenom}
          </h2>
          <p className="text-gray-600 mt-1">Matière : {enseignant.matiere}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mes cours</h3>
          {cours.length === 0 ? (
            <p className="text-gray-500">Aucun cours assigné.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cours.map((c) => (
                <li key={c.id} className="py-3 flex justify-between">
                  <span className="font-medium">{c.nom}</span>
                  <span className="text-gray-500">{c.horaire}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}