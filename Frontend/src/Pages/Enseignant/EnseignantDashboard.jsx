import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Api/Api';

export default function EnseignantDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [enseignant, setEnseignant] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [etudiants, setEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classAvailability, setClassAvailability] = useState({});
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [resEnseignant, resEtudiants, resClasses, resNotes, resAbsences] = await Promise.all([
        api.get(`/enseignants/${id}`),
        api.get('/etudiants'),
        api.get('/classes'),
        api.get('/notes'),
        api.get('/absences')
      ]);
      setEnseignant(resEnseignant.data);
      setEtudiants(resEtudiants.data);
      setClasses(resClasses.data);
      const availabilityMap = {};
      resClasses.data.forEach((classe) => {
        availabilityMap[classe.id] = classe.disponible ?? true;
      });
      setClassAvailability(availabilityMap);
      setNotes(resNotes.data);
      setAbsences(resAbsences.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    const defaultValues = item || {};

    if (!item && type === 'absence') {
      defaultValues.justifiee = true;
      defaultValues.enseignant_id = id;
    }

    setFormData(defaultValues);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setCurrentItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'etudiant') {
        if (currentItem) {
          await api.put(`/etudiants/${currentItem.id}`, formData);
        } else {
          await api.post('/etudiants', formData);
        }
      } else if (modalType === 'classe') {
        if (currentItem) {
          await api.put(`/classes/${currentItem.id}`, formData);
        } else {
          await api.post('/classes', formData);
        }
      } else if (modalType === 'note') {
        if (currentItem) {
          await api.put(`/notes/${currentItem.id}`, formData);
        } else {
          await api.post('/notes', formData);
        }
      } else if (modalType === 'absence') {
        if (currentItem) {
          await api.put(`/absences/${currentItem.id}`, formData);
        } else {
          await api.post('/absences', formData);
        }
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await api.delete(`/${type}s/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleClassAvailabilityChange = async (classeId, available) => {
    try {
      await api.put(`/classes/${classeId}`, { disponible: available });
      setClassAvailability(prev => ({
        ...prev,
        [classeId]: available,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center mt-10">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Espace Enseignant</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          Déconnexion
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {enseignant.nom} {enseignant.prenom || ''}
          </h2>
          <p className="text-gray-600 text-lg">Matière : {enseignant.matiere}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            {[
              { key: 'overview', label: 'Dashboard' },
              { key: 'etudiants', label: 'Étudiants' },
              { key: 'classes', label: 'Classes' },
              { key: 'notes', label: 'Notes' },
              { key: 'absences', label: 'Absences' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                  activeTab === tab.key
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-800">Total Étudiants</h3>
                <p className="text-3xl font-bold text-blue-600">{etudiants.length}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-green-800">Total Classes</h3>
                <p className="text-3xl font-bold text-green-600">{classes.length}</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-yellow-800">Total Notes</h3>
                <p className="text-3xl font-bold text-yellow-600">{notes.length}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-red-800">Total Absences</h3>
                <p className="text-3xl font-bold text-red-600">{absences.length}</p>
              </div>
            </div>
          )}

          {activeTab === 'etudiants' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Gestion des Étudiants</h3>
                <button
                  onClick={() => openModal('etudiant')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Ajouter Étudiant
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse bg-white rounded-lg shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left">Nom</th>
                      <th className="px-4 py-3 text-left">Prénom</th>
                      <th className="px-4 py-3 text-left">Classe</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etudiants.map(etudiant => (
                      <tr key={etudiant.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{etudiant.nom}</td>
                        <td className="px-4 py-3">{etudiant.prenom}</td>
                        <td className="px-4 py-3">{etudiant.classe?.nom || 'N/A'}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => openModal('etudiant', etudiant)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete('etudiant', etudiant.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Disponibilité des Classes</h3>
                <p className="text-sm text-gray-500 mt-2">Consulter la disponibilité des classes. Les classes bloquées par l'administrateur n'affichent pas d'option de modification.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(classe => (
                  <div key={classe.id} className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-semibold text-slate-900">{classe.nom}</h4>
                        <p className="text-sm text-slate-600">Niveau : {classe.niveau}</p>
                        <p className="text-sm text-slate-500 mt-1">Étudiants : {classe.etudiants_count || 0}</p>
                      </div>
                      {classAvailability[classe.id] && (
                        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={classAvailability[classe.id] ?? true}
                            onChange={e => handleClassAvailabilityChange(classe.id, e.target.checked)}
                            className="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          Disponible
                        </label>
                      )}
                    </div>
                    <div className="mt-4">
                      {classAvailability[classe.id] ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
                          Classe occupée — l'administrateur a bloqué cette classe
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Gestion des Notes</h3>
                <button
                  onClick={() => openModal('note')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Ajouter Note
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse bg-white rounded-lg shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left">Étudiant</th>
                      <th className="px-4 py-3 text-left">Matière</th>
                      <th className="px-4 py-3 text-left">Note</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map(note => (
                      <tr key={note.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{note.etudiant?.nom} {note.etudiant?.prenom}</td>
                        <td className="px-4 py-3">{note.matiere}</td>
                        <td className="px-4 py-3">{note.note}/20</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => openModal('note', note)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete('note', note.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'absences' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Gestion des Absences</h3>
                <button
                  onClick={() => openModal('absence')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Ajouter Absence
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse bg-white rounded-lg shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left">Étudiant</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Heures</th>
                      <th className="px-4 py-3 text-left">Justifiée</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map(absence => (
                      <tr key={absence.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{absence.etudiant?.nom} {absence.etudiant?.prenom}</td>
                        <td className="px-4 py-3">{absence.date}</td>
                        <td className="px-4 py-3">{absence.nb_heures}</td>
                        <td className="px-4 py-3">{absence.justifiee ? 'Oui' : 'Non'}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => openModal('absence', absence)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete('absence', absence.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">
              {currentItem ? 'Modifier' : 'Ajouter'} {modalType === 'etudiant' ? 'Étudiant' : modalType === 'classe' ? 'Classe' : modalType === 'note' ? 'Note' : 'Absence'}
            </h3>
            <form onSubmit={handleSubmit}>
              {modalType === 'etudiant' && (
                <>
                  <input
                    type="text"
                    placeholder="Nom"
                    value={formData.nom || ''}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={formData.prenom || ''}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                  <input
                    type="date"
                    value={formData.date_naissance || ''}
                    onChange={(e) => setFormData({...formData, date_naissance: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required={!currentItem}
                  />
                  {!currentItem && (
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full p-3 border rounded-lg mb-4"
                      required
                    />
                  )}
                  <select
                    value={formData.classe_id || ''}
                    onChange={(e) => setFormData({...formData, classe_id: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(classe => (
                      <option key={classe.id} value={classe.id}>{classe.nom}</option>
                    ))}
                  </select>
                </>
              )}
              {modalType === 'classe' && (
                <>
                  <input
                    type="text"
                    placeholder="Nom de la classe"
                    value={formData.nom || ''}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Niveau"
                    value={formData.niveau || ''}
                    onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                </>
              )}
              {modalType === 'note' && (
                <>
                  <select
                    value={formData.etudiant_id || ''}
                    onChange={(e) => setFormData({...formData, etudiant_id: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {etudiants.map(etudiant => (
                      <option key={etudiant.id} value={etudiant.id}>{etudiant.nom} {etudiant.prenom}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Matière"
                    value={formData.matiere || ''}
                    onChange={(e) => setFormData({...formData, matiere: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Note"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formData.note || ''}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                </>
              )}
              {modalType === 'absence' && (
                <>
                  <select
                    value={formData.etudiant_id || ''}
                    onChange={(e) => setFormData({...formData, etudiant_id: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {etudiants.map(etudiant => (
                      <option key={etudiant.id} value={etudiant.id}>{etudiant.nom} {etudiant.prenom}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Nombre d'heures"
                    min="0"
                    step="0.5"
                    value={formData.nb_heures || ''}
                    onChange={(e) => setFormData({...formData, nb_heures: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  />
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={formData.justifiee ?? true}
                      onChange={(e) => setFormData({...formData, justifiee: e.target.checked})}
                      className="mr-2"
                    />
                    Justifiée
                  </label>
                  <select
                    value={formData.enseignant_id}
                    onChange={(e) => setFormData({...formData, enseignant_id: e.target.value})}
                    className="w-full p-3 border rounded-lg mb-4"
                    required
                  >
                    <option value={id}>Vous-même</option>
                  </select>
                </>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  {currentItem ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}