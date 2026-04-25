// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, enseignants: 0, etudiants: 0, classes: 0 });
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, classesRes, enseignantsRes, etudiantsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/classes'),
        api.get('/enseignants'),
        api.get('/etudiants'),
        api.get('/admin/users'),
      ]);

      setStats(statsRes.data);
      setClasses(classesRes.data);
      setEnseignants(enseignantsRes.data);
      setEtudiants(etudiantsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.clear();
    navigate('/login');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);

    if (item) {
      if (type === 'classe') {
        setFormData({
          nom: item.nom,
          niveau: item.niveau,
          disponible: item.disponible,
        });
      } else if (type === 'enseignant') {
        setFormData({
          nom: item.nom,
          matiere: item.matiere,
          email: item.user?.email || '',
        });
      } else if (type === 'etudiant') {
        setFormData({
          nom: item.nom,
          prenom: item.prenom,
          date_naissance: item.date_naissance,
          email: item.user?.email ||'',
          classe_id: item.classe_id,
        });
      }
    } else {
      if (type === 'classe') {
        setFormData({ nom: '', niveau: '', disponible: true });
      } else if (type === 'enseignant') {
        setFormData({ nom: '', matiere: '', email: '', password: '' });
      } else if (type === 'etudiant') {
        setFormData({
          nom: '',
          prenom: '',
          date_naissance: '',
          email: '',
          password: '',
          classe_id: classes[0]?.id || '',
        });
      }
    }

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
      if (modalType === 'classe') {
        currentItem
          ? await api.put(`/classes/${currentItem.id}`, formData)
          : await api.post('/classes', formData);
      }

      if (modalType === 'enseignant') {
        currentItem
          ? await api.put(`/enseignants/${currentItem.id}`, formData)
          : await api.post('/enseignants', formData);
      }

      if (modalType === 'etudiant') {
        await api[currentItem ? 'put' : 'post'](
          `/etudiants${currentItem ? `/${currentItem.id}` : ''}`,
          formData
        );
      }

      fetchAdminData();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;
    await api.delete(`/${type}/${id}`);
    fetchAdminData();
  };

  if (loading) return <div className="text-center mt-10">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white p-4 flex justify-between shadow">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="p-6">
        {/* TABS */}
        <div className="flex gap-4 mb-6">
          {['overview', 'classes', 'enseignants', 'etudiants', 'users'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <p>Users: {stats.users}</p>
            <p>Enseignants: {stats.enseignants}</p>
            <p>Étudiants: {stats.etudiants}</p>
            <p>Classes: {stats.classes}</p>
          </div>
        )}

        {/* CLASSES */}
        {activeTab === 'classes' && (
          <div>
            <button onClick={() => openModal('classe')}>Ajouter</button>
            {classes.map((c) => (
              <div key={c.id}>
                {c.nom} - {c.niveau}
                <button onClick={() => openModal('classe', c)}>Edit</button>
                <button onClick={() => deleteItem('classes', c.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* ENSEIGNANTS */}
        {activeTab === 'enseignants' && (
          <div>
            <button onClick={() => openModal('enseignant')}>Ajouter</button>
            {enseignants.map((e) => (
              <div key={e.id}>
                {e.nom} - {e.user?.email || 'N/A'}
                <button onClick={() => openModal('enseignant', e)}>Edit</button>
                <button onClick={() => deleteItem('enseignants', e.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* ETUDIANTS */}
        {activeTab === 'etudiants' && (
          <div>
            <button onClick={() => openModal('etudiant')}>Ajouter</button>
            {etudiants.map((e) => (
              <div key={e.id}>
                {e.nom} {e.prenom} - {e.user?.email || 'N/A'}
                <button onClick={() => openModal('etudiant', e)}>Edit</button>
                <button onClick={() => deleteItem('etudiants', e.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div>
            {users.map((u) => (
              <div key={u.id}>
                {u.name} - {u.email}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded">
            <input
              placeholder="Nom"
              value={formData.nom || ''}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            />

            <button type="submit">Save</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}