import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Api/Api';

export default function EtudiantDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [etudiant, setEtudiant] = useState(null);
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEtudiant = await api.get(`/etudiants/${id}`);
        setEtudiant(resEtudiant.data);
        const resNotes = await api.get(`/etudiants/${id}/notes`);
        setNotes(resNotes.data);
        const resAbsences = await api.get(`/etudiants/${id}/absences`);
        setAbsences(resAbsences.data);
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

  if (!etudiant) return <div className="text-center mt-10">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Espace Étudiant</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Déconnexion
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6 mt-8">
        {/* Profil */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {etudiant.prenom} {etudiant.nom}
          </h2>
          <p className="text-gray-600 mt-1">Classe : {etudiant.classe?.nom || 'Non définie'}</p>
          <p className="text-gray-500 text-sm">Date de naissance : {etudiant.date_naissance}</p>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mes notes</h3>
          {notes.length === 0 ? (
            <p className="text-gray-500">Aucune note disponible.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Matière</th>
                    <th className="px-4 py-2 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id}>
                      <td className="border px-4 py-2">{note.matiere}</td>
                      <td className="border px-4 py-2 font-semibold">{note.valeur}/20</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Absences */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mes absences</h3>
          {absences.length === 0 ? (
            <p className="text-gray-500">Aucune absence enregistrée.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {absences.map((abs) => (
                <li key={abs.id} className="py-3">
                  <span className="font-medium">{abs.date}</span> – {abs.justifiee ? 'Justifiée' : 'Non justifiée'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}