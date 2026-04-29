// src/pages/Enseignant/EnseignantDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import {
  Users,
  BookOpen,
  CalendarX,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  X,
  ChevronRight,
  Home,
  Edit,
  Trash2,
  User,
  Key
} from 'lucide-react';

export default function EnseignantDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [enseignant, setEnseignant] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enseignantsList, setEnseignantsList] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('profil');
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [currentEtudiant, setCurrentEtudiant] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [currentAbsence, setCurrentAbsence] = useState(null);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCreateClasseModal, setShowCreateClasseModal] = useState(false);
  const [selectedEtudiantNotes, setSelectedEtudiantNotes] = useState(null);
  const [selectedEtudiantAbsences, setSelectedEtudiantAbsences] = useState(null);
  const [studentNotes, setStudentNotes] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [absenceForm, setAbsenceForm] = useState({
    etudiant_id: '',
    date: new Date().toISOString().split('T')[0],
    nb_heures: 1
  });
  const [noteForm, setNoteForm] = useState({
    etudiant_id: '',
    matiere: '',
    note: ''
  });
  const [newClasse, setNewClasse] = useState({
    nom: '',
    niveau: '',
    enseignant_id: parseInt(id)
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Toast auto
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEnseignant = await api.get(`/enseignants/${id}`);
        setEnseignant(resEnseignant.data);
      } catch (error) { console.error(error); }

      try {
        const resClasses = await api.get('/classes');
        setClasses(resClasses.data);
      } catch (error) { console.error(error); }

      try {
        const resEnseignantsList = await api.get('/enseignants');
        setEnseignantsList(resEnseignantsList.data);
      } catch (error) { console.warn("Liste enseignants non disponible"); setEnseignantsList([]); }

      try {
        const resEtudiants = await api.get('/etudiants');
        setEtudiants(resEtudiants.data);
      } catch (error) { console.error(error); }

      try {
        const resAbsences = await api.get('/absences');
        setAbsences(resAbsences.data);
      } catch (error) { console.error(error); }

      try {
        const resNotes = await api.get('/notes');
        setNotes(resNotes.data);
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, [id]);

  // Charger les notes spécifiques de l'étudiant sélectionné (matière de l'enseignant)
  useEffect(() => {
    const fetchStudentNotes = async () => {
      if (selectedEtudiantNotes && enseignant) {
        try {
          const res = await api.get(`/etudiants/${selectedEtudiantNotes.id}/notes/matiere`);
          setStudentNotes(res.data);
        } catch (error) {
          console.error("Erreur chargement notes étudiant", error);
          setStudentNotes([]);
        }
      } else {
        setStudentNotes([]);
      }
    };
    fetchStudentNotes();
  }, [selectedEtudiantNotes, enseignant]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) { console.error(error); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // --- Changement mot de passe ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await api.post('/change-password', passwordForm);
      setPasswordSuccess('Mot de passe modifié avec succès.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors du changement.';
      setPasswordError(msg);
    }
  };

  // ---------- Absences ----------
  const openAddAbsence = (etudiant) => {
    setCurrentEtudiant(etudiant);
    setCurrentAbsence(null);
    setAbsenceForm({
      etudiant_id: etudiant.id,
      date: new Date().toISOString().split('T')[0],
      nb_heures: 1
    });
    setShowAbsenceModal(true);
  };

  const openEditAbsence = (absence) => {
    setCurrentAbsence(absence);
    setAbsenceForm({
      etudiant_id: absence.etudiant_id,
      date: absence.date.split('T')[0],
      nb_heures: absence.nb_heures
    });
    setShowAbsenceModal(true);
  };

  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        etudiant_id: absenceForm.etudiant_id,
        date: absenceForm.date,
        nb_heures: parseFloat(absenceForm.nb_heures)
      };
      if (currentAbsence) {
        await api.put(`/absences/${currentAbsence.id}`, payload);
        setMessage({ text: 'Absence modifiée', type: 'success' });
      } else {
        await api.post('/absences', { ...payload, justifiee: false });
        setMessage({ text: 'Absence ajoutée', type: 'success' });
      }
      const res = await api.get('/absences');
      setAbsences(res.data);
      setShowAbsenceModal(false);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur', type: 'error' });
    }
  };

  const handleDeleteAbsence = async (absenceId) => {
    if (window.confirm('Supprimer cette absence ?')) {
      try {
        await api.delete(`/absences/${absenceId}`);
        const res = await api.get('/absences');
        setAbsences(res.data);
        setMessage({ text: 'Absence supprimée', type: 'success' });
      } catch (error) {
        console.error(error);
        setMessage({ text: 'Erreur suppression', type: 'error' });
      }
    }
  };

  // ---------- Notes ----------
  const openAddNote = (etudiant) => {
    setCurrentEtudiant(etudiant);
    setCurrentNote(null);
    setNoteForm({
      etudiant_id: etudiant.id,
      matiere: enseignant?.matiere || '',
      note: ''
    });
    setShowNoteModal(true);
  };

  const openEditNote = (note) => {
    setCurrentNote(note);
    setNoteForm({
      etudiant_id: selectedEtudiantNotes?.id,
      matiere: note.matiere,
      note: note.note
    });
    setShowNoteModal(true);
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentNote) {
        await api.put(`/notes/${currentNote.id}`, noteForm);
        setMessage({ text: 'Note modifiée', type: 'success' });
      } else {
        await api.post('/notes', noteForm);
        setMessage({ text: 'Note ajoutée', type: 'success' });
      }
      const resNotes = await api.get('/notes');
      setNotes(resNotes.data);
      if (selectedEtudiantNotes) {
        const resStudent = await api.get(`/etudiants/${selectedEtudiantNotes.id}/notes/matiere`);
        setStudentNotes(resStudent.data);
      }
      setShowNoteModal(false);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur', type: 'error' });
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Supprimer cette note ?')) {
      try {
        await api.delete(`/notes/${noteId}`);
        const resNotes = await api.get('/notes');
        setNotes(resNotes.data);
        if (selectedEtudiantNotes) {
          const resStudent = await api.get(`/etudiants/${selectedEtudiantNotes.id}/notes/matiere`);
          setStudentNotes(resStudent.data);
        }
        setMessage({ text: 'Note supprimée', type: 'success' });
      } catch (error) {
        console.error(error);
        setMessage({ text: 'Erreur suppression', type: 'error' });
      }
    }
  };

  // ---------- Classes ----------
  const handleCreateClasse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', newClasse);
      const res = await api.get('/classes');
      setClasses(res.data);
      setShowCreateClasseModal(false);
      setNewClasse({ nom: '', niveau: '', enseignant_id: parseInt(id) });
      setMessage({ text: 'Classe créée', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur création', type: 'error' });
    }
  };

  // Utilitaires d'affichage
  const etudiantsParClasse = selectedClasse
    ? etudiants.filter(e => e.classe_id === selectedClasse.id)
    : [];

  const getAbsencesForEtudiant = (etudiantId) => absences.filter(a => a.etudiant_id === etudiantId);
  
  // Filtrer les notes de l'enseignant (sa matière) – version insensible à la casse
  const mesNotes = notes.filter(n => n.matiere?.toLowerCase().trim() === enseignant?.matiere?.toLowerCase().trim());
  const mesAbsences = absences.filter(a => a.enseignant_id === parseInt(id));

  if (!enseignant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const navItems = [
    { id: 'profil', label: 'Mon profil', icon: User },
    { id: 'overview', label: 'Tableau de bord', icon: Home },
    { id: 'classes', label: 'Mes classes', icon: GraduationCap },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'absences', label: 'Absences', icon: CalendarX },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Toast message */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message.text}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">Espace Enseignant</span>
            </div>
            <div className="hidden md:flex gap-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === item.id
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline text-gray-700 dark:text-gray-200">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border z-20">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:hidden flex flex-wrap gap-2 py-2 border-t">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${activeTab === item.id ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
                  }`}
              >
                <item.icon className="h-3 w-3" /> {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ONGLET TABLEAU DE BORD */}
        {activeTab === 'overview' && (
          <div>
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Tableau de bord</h2>
              <p className="text-rose-100">Vue d’ensemble de votre activité</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                <GraduationCap className="h-8 w-8 text-indigo-500 mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{classes.length}</p>
                <p className="text-gray-600 dark:text-gray-300">Classes</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                <Users className="h-8 w-8 text-indigo-500 mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{etudiants.length}</p>
                <p className="text-gray-600 dark:text-gray-300">Étudiants</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                <BookOpen className="h-8 w-8 text-indigo-500 mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{mesNotes.length}</p>
                <p className="text-gray-600 dark:text-gray-300">Notes saisies</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                <CalendarX className="h-8 w-8 text-indigo-500 mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{mesAbsences.length}</p>
                <p className="text-gray-600 dark:text-gray-300">Absences</p>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET MON PROFIL */}
        {activeTab === 'profil' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Mon profil</h2>
              <p className="text-indigo-100">Informations personnelles et sécurisation</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                    {enseignant?.nom?.charAt(0)}{enseignant?.prenom?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {enseignant?.prenom} {enseignant?.nom}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">Matière : {enseignant?.matiere}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                  <p className="font-medium text-gray-800 dark:text-white">{enseignant?.nom} {enseignant?.prenom}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-800 dark:text-white">{user?.email}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Matière enseignée</p>
                  <p className="font-medium text-gray-800 dark:text-white">{enseignant?.matiere}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre de classes</p>
                  <p className="font-medium text-gray-800 dark:text-white">{classes.length}</p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                  <Key className="h-4 w-4" />
                  Changer mon mot de passe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET MES CLASSES */}
        {activeTab === 'classes' && (
          <div>
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Mes classes</h2>
              <p className="text-emerald-100">Liste des classes et étudiants</p>
            </div>
            {classes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">Aucune classe affectée pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(classe => (
                  <div key={classe.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition">
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-800 dark:text-white">{classe.nom}</h4>
                          <p className="text-gray-500 dark:text-gray-400">Niveau : {classe.niveau || 'Non défini'}</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            {etudiants.filter(e => e.classe_id === classe.id).length} étudiants
                          </p>
                        </div>
                        <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                          <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                        </div>
                      </div>
                    </div>
                    {selectedClasse?.id === classe.id && (
                      <div className="border-t p-4 bg-gray-50 dark:bg-gray-700/30">
                        <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">Étudiants</h5>
                        {etudiants.filter(e => e.classe_id === classe.id).length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400">Aucun étudiant dans cette classe.</p>
                        ) : (
                          <div className="space-y-2">
                            {etudiants.filter(e => e.classe_id === classe.id).map(etudiant => (
                              <div key={etudiant.id} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <p className="font-medium text-gray-800 dark:text-white">{etudiant.nom} {etudiant.prenom}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET NOTES */}
        {activeTab === 'notes' && (
          <div>
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Gérer les notes</h2>
              <p className="text-green-100">Saisir, modifier ou supprimer les notes de vos étudiants</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Choisir une classe</h4>
                {classes.map(classe => (
                  <div key={classe.id} className="border rounded-lg mb-3">
                    <button
                      onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)}
                      className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="font-medium text-gray-800 dark:text-white">{classe.nom}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                    {selectedClasse?.id === classe.id && (
                      <div className="border-t p-4 bg-gray-50 dark:bg-gray-700/30">
                        {etudiantsParClasse.map(etudiant => (
                          <div
                            key={etudiant.id}
                            className={`p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 ${selectedEtudiantNotes?.id === etudiant.id ? 'bg-indigo-100 dark:bg-indigo-900' : ''}`}
                            onClick={() => setSelectedEtudiantNotes(etudiant)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800 dark:text-white">{etudiant.nom} {etudiant.prenom}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); openAddNote(etudiant); }}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                              >
                                + Note
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  {selectedEtudiantNotes
                    ? `Notes de ${selectedEtudiantNotes.nom} ${selectedEtudiantNotes.prenom} (${enseignant.matiere})`
                    : 'Notes récentes'}
                </h4>
                {!selectedEtudiantNotes ? (
                  <p className="text-gray-500 dark:text-gray-400">Sélectionnez un étudiant pour voir ses notes.</p>
                ) : (
                  <>
                    {studentNotes.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">Aucune note dans cette matière.</p>
                    ) : (
                      <div className="space-y-2">
                        {studentNotes.map(note => (
                          <div key={note.id} className="border-b pb-2 flex justify-between items-center">
                            <span className="font-semibold text-gray-800 dark:text-white">{note.note}/20</span>
                            <div className="flex gap-2">
                              <button onClick={() => openEditNote(note)} className="text-blue-500 hover:text-blue-700">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ONGLET ABSENCES */}
        {activeTab === 'absences' && (
          <div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Gérer les absences</h2>
              <p className="text-orange-100">Suivre les présences et gérer les justifications</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Choisir une classe</h4>
                {classes.map(classe => (
                  <div key={classe.id} className="border rounded-lg mb-3 dark:border-gray-700">
                    <button
                      onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)}
                      className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="font-medium text-gray-800 dark:text-white">{classe.nom}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                    {selectedClasse?.id === classe.id && (
                      <div className="border-t p-4 bg-gray-50 dark:bg-gray-700/30">
                        {etudiantsParClasse.map(etudiant => (
                          <div
                            key={etudiant.id}
                            className={`p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 ${selectedEtudiantAbsences?.id === etudiant.id ? 'bg-red-100 dark:bg-red-900' : ''}`}
                            onClick={() => setSelectedEtudiantAbsences(etudiant)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800 dark:text-white">{etudiant.nom} {etudiant.prenom}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); openAddAbsence(etudiant); }}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                              >
                                + Absence
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  {selectedEtudiantAbsences
                    ? `Absences de ${selectedEtudiantAbsences.nom} ${selectedEtudiantAbsences.prenom}`
                    : 'Absences récentes'}
                </h4>
                {!selectedEtudiantAbsences ? (
                  <p className="text-gray-500 dark:text-gray-400">Sélectionnez un étudiant pour voir ses absences.</p>
                ) : (
                  <>
                    {getAbsencesForEtudiant(selectedEtudiantAbsences.id).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">Aucune absence enregistrée.</p>
                    ) : (
                      <div className="space-y-2">
                        {getAbsencesForEtudiant(selectedEtudiantAbsences.id).map(a => (
                          <div key={a.id} className="border-b pb-2 flex justify-between items-center">
                            <div className="text-gray-800 dark:text-white">
                              <span>{formatDate(a.date)} ({a.nb_heures} h)</span>
                              {a.justifiee ? (
                                <span className="ml-2 text-green-600 inline-flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Justifiée</span>
                              ) : (
                                <span className="ml-2 text-red-600 inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> Non justifiée</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => openEditAbsence(a)} className="text-blue-500 hover:text-blue-700">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDeleteAbsence(a.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modale création de classe */}
      {showCreateClasseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Créer une classe</h3>
              <button onClick={() => setShowCreateClasseModal(false)}><X className="text-gray-500 hover:text-gray-700" /></button>
            </div>
            <form onSubmit={handleCreateClasse} className="space-y-4">
              <input type="text" placeholder="Nom" required className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newClasse.nom} onChange={e => setNewClasse({ ...newClasse, nom: e.target.value })} />
              <input type="text" placeholder="Niveau" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newClasse.niveau} onChange={e => setNewClasse({ ...newClasse, niveau: e.target.value })} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateClasseModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale absence */}
      {showAbsenceModal && currentEtudiant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{currentAbsence ? 'Modifier' : 'Ajouter'} une absence</h3>
            <form onSubmit={handleAbsenceSubmit} className="space-y-4">
              <input type="text" readOnly value={`${currentEtudiant.nom} ${currentEtudiant.prenom}`} className="w-full border rounded-lg p-2 bg-gray-100 dark:bg-gray-700 dark:text-white" />
              <input type="date" value={absenceForm.date} onChange={e => setAbsenceForm({ ...absenceForm, date: e.target.value })} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input type="number" step="0.5" value={absenceForm.nb_heures} onChange={e => setAbsenceForm({ ...absenceForm, nb_heures: parseFloat(e.target.value) })} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAbsenceModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale note */}
      {showNoteModal && currentEtudiant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{currentNote ? 'Modifier' : 'Ajouter'} une note</h3>
            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <input type="text" readOnly value={`${currentEtudiant.nom} ${currentEtudiant.prenom}`} className="w-full border rounded-lg p-2 bg-gray-100 dark:bg-gray-700 dark:text-white" />
              <input type="text" value={enseignant?.matiere} readOnly className="w-full border rounded-lg p-2 bg-gray-100 dark:bg-gray-700 dark:text-white" />
              <input type="number" step="0.1" min="0" max="20" value={noteForm.note} onChange={e => setNoteForm({ ...noteForm, note: e.target.value })} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Changer mon mot de passe</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
                <input type="password" required className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                <input type="password" required className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmation</label>
                <input type="password" required className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={passwordForm.new_password_confirmation} onChange={e => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} />
              </div>
              {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition">Modifier</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}