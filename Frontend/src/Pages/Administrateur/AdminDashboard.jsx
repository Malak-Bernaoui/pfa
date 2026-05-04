import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import {
  Users, BookOpen, CalendarX, Moon, Sun, LogOut, ChevronDown,
  GraduationCap, Calendar, Mail, Home, Edit, Trash2, Plus, X,
  CheckCircle, XCircle, Eye, Printer, UserPlus, ChevronRight
} from 'lucide-react';

// Composants memo pour les notes et absences (performances)
const StudentNotesList = React.memo(({ notes, onEdit, onDelete }) => {
  if (notes.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">Aucune note</p>;
  return (
    <div className="space-y-1">
      {notes.map(n => (
        <div key={n.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
          <span className="text-sm dark:text-gray-200">{n.matiere} : {n.note}/20</span>
          <div className="flex gap-2">
            <button onClick={() => onEdit(n)} className="text-blue-500 dark:text-blue-400"><Edit size={14} /></button>
            <button onClick={() => onDelete(n.id)} className="text-red-500 dark:text-red-400"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
});

const StudentAbsencesList = React.memo(({ absences, onEdit, onDelete, formatDate, enseignants }) => {
  if (absences.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">Aucune absence</p>;
  return (
    <div className="space-y-1">
      {absences.map(a => {
        const enseignant = enseignants.find(e => e.id === a.enseignant_id);
        return (
          <div key={a.id} className="flex justify-between items-center bg-red-50 dark:bg-red-900/30 rounded px-2 py-1">
            <div className="text-sm dark:text-gray-200">
              {formatDate(a.date)} ({a.nb_heures} h) - {a.justifiee ? 'Justifiée' : 'Non justifiée'}
              {enseignant && <span className="ml-2 text-gray-600 dark:text-gray-400">({enseignant.nom} - {enseignant.matiere})</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(a)} className="text-blue-500 dark:text-blue-400"><Edit size={14}/></button>
              <button onClick={() => onDelete(a.id)} className="text-red-500 dark:text-red-400"><Trash2 size={14}/></button>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showClasseModal, setShowClasseModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [currentEtudiant, setCurrentEtudiant] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [currentAbsence, setCurrentAbsence] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Données
  const [etudiants, setEtudiants] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [administrateurs, setAdministrateurs] = useState([]);
  const [usersNoRole, setUsersNoRole] = useState([]);
  const [classes, setClasses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [contacts, setContacts] = useState([]);

  // États formulaires
  const [userModalType, setUserModalType] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedExistingUser, setSelectedExistingUser] = useState('');
  const [userForm, setUserForm] = useState({ nom: '', prenom: '', email: '', password: '', matiere: '', classe_id: '', date_naissance: '' });
  const [classeForm, setClasseForm] = useState({ nom: '', niveau: '' });
  const [currentClasse, setCurrentClasse] = useState(null);
  const [noteForm, setNoteForm] = useState({ etudiant_id: '', matiere: '', note: '' });
  const [absenceForm, setAbsenceForm] = useState({ etudiant_id: '', date: new Date().toISOString().split('T')[0], nb_heures: 1, justifiee: false, enseignant_id: '' });
  const [assignForm, setAssignForm] = useState({ classe_id: '', enseignant_id: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Toast
  useEffect(() => {
    if (message.text) setTimeout(() => setMessage({ text: '', type: '' }), 3000);
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
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resEtudiants, resEnseignants, resAdmins, resClasses, resNotes, resAbsences, resContacts, resUsersNoRole] = await Promise.all([
        api.get('/etudiants'), api.get('/enseignants'), api.get('/administrateurs'), api.get('/classes'),
        api.get('/notes'), api.get('/absences'), api.get('/contacts'), api.get('/users/no-role')
      ]);
      setEtudiants(resEtudiants.data);
      setEnseignants(resEnseignants.data);
      setAdministrateurs(resAdmins.data);
      setClasses(resClasses.data);
      setNotes(resNotes.data);
      setAbsences(resAbsences.data);
      setContacts(resContacts.data);
      setUsersNoRole(resUsersNoRole.data);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) { console.error(error); }
  };

  // Mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await api.post('/change-password', passwordForm);
      setPasswordSuccess('Mot de passe modifié.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Erreur');
    }
  };

  // ========== GESTION UTILISATEURS ==========
  const openAddUser = (type) => {
    setUserModalType(type);
    setCurrentUser(null);
    setSelectedExistingUser('');
    setUserForm({ nom: '', prenom: '', email: '', password: '', matiere: '', classe_id: '', date_naissance: '' });
    setShowUserModal(true);
  };
  const openEditUser = (type, userData) => {
    setUserModalType(type);
    setCurrentUser(userData);
    setSelectedExistingUser('');
    if (type === 'etudiant') {
      setUserForm({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        email: userData.user?.email || '',
        password: '',
        matiere: '',
        classe_id: userData.classe_id || '',
        date_naissance: userData.date_naissance || ''
      });
    } else if (type === 'enseignant') {
      const nameParts = userData.user?.name?.split(' ') || ['', ''];
      setUserForm({
        nom: nameParts[1] || '',
        prenom: nameParts[0] || '',
        email: userData.user?.email || '',
        password: '',
        matiere: userData.matiere || '',
        classe_id: '',
        date_naissance: ''
      });
    } else {
      const nameParts = userData.user?.name?.split(' ') || ['', ''];
      setUserForm({
        nom: nameParts[0] || '',
        prenom: nameParts[1] || '',
        email: userData.user?.email || '',
        password: '',
        matiere: '',
        classe_id: '',
        date_naissance: ''
      });
    }
    setShowUserModal(true);
  };
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '', payload = {};
      if (selectedExistingUser) {
        const existingUser = usersNoRole.find(u => u.id === parseInt(selectedExistingUser));
        if (!existingUser) throw new Error('Utilisateur non trouvé');
        if (userModalType === 'etudiant') {
          endpoint = '/etudiants';
          payload = { user_id: existingUser.id, nom: userForm.nom, prenom: userForm.prenom, date_naissance: userForm.date_naissance || null, classe_id: userForm.classe_id };
        } else if (userModalType === 'enseignant') {
          endpoint = '/enseignants';
          payload = { user_id: existingUser.id, nom: userForm.nom, matiere: userForm.matiere };
        } else {
          endpoint = '/administrateurs';
          payload = { user_id: existingUser.id };
        }
        await api.post(endpoint, payload);
        setMessage({ text: `${userModalType} ajouté via utilisateur existant`, type: 'success' });
      } else {
        if (userModalType === 'etudiant') {
          endpoint = '/etudiants';
          payload = { nom: userForm.nom, prenom: userForm.prenom, email: userForm.email, password: userForm.password, date_naissance: userForm.date_naissance || null, classe_id: userForm.classe_id };
        } else if (userModalType === 'enseignant') {
          endpoint = '/enseignants';
          payload = { nom: userForm.nom, prenom: userForm.prenom, email: userForm.email, password: userForm.password, matiere: userForm.matiere };
        } else {
          endpoint = '/administrateurs';
          payload = { nom: userForm.nom, prenom: userForm.prenom, email: userForm.email, password: userForm.password };
        }
        if (currentUser) await api.put(`${endpoint}/${currentUser.id}`, payload);
        else await api.post(endpoint, payload);
        setMessage({ text: `${userModalType} ${currentUser ? 'modifié' : 'ajouté'}`, type: 'success' });
      }
      fetchAllData();
      setShowUserModal(false);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur lors de l’opération', type: 'error' });
    }
  };
  const handleDeleteUser = async (type, id) => {
    if (!window.confirm(`Supprimer définitivement ce ${type} ?`)) return;
    try {
      let endpoint = '';
      if (type === 'etudiant') endpoint = `/etudiants/${id}`;
      else if (type === 'enseignant') endpoint = `/enseignants/${id}`;
      else if (type === 'administrateur') endpoint = `/administrateurs/${id}`;
      await api.delete(endpoint);
      setMessage({ text: `${type} supprimé`, type: 'success' });
      fetchAllData();
    } catch (error) { setMessage({ text: 'Erreur suppression', type: 'error' }); }
  };

  // ========== CLASSES ==========
  const openAddClasse = () => {
    setCurrentClasse(null);
    setClasseForm({ nom: '', niveau: '' });
    setShowClasseModal(true);
  };
  const openEditClasse = (classe) => {
    setCurrentClasse(classe);
    setClasseForm({ nom: classe.nom, niveau: classe.niveau || '' });
    setShowClasseModal(true);
  };
  const handleClasseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentClasse) await api.put(`/classes/${currentClasse.id}`, classeForm);
      else await api.post('/classes', classeForm);
      setMessage({ text: `Classe ${currentClasse ? 'modifiée' : 'ajoutée'}`, type: 'success' });
      fetchAllData();
      setShowClasseModal(false);
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };
  const handleDeleteClasse = async (id) => {
    if (!window.confirm('Supprimer cette classe ?')) return;
    try {
      await api.delete(`/classes/${id}`);
      setMessage({ text: 'Classe supprimée', type: 'success' });
      fetchAllData();
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };

  // ========== NOTES ==========
  const openAddNote = (etudiant) => {
    setCurrentNote(null);
    setNoteForm({ etudiant_id: etudiant.id, matiere: '', note: '' });
    setShowNoteModal(true);
  };
  const openEditNote = (note) => {
    setCurrentNote(note);
    setNoteForm({ etudiant_id: note.etudiant_id, matiere: note.matiere, note: note.note });
    setShowNoteModal(true);
  };
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Supprimer cette note ?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      fetchAllData();
      setMessage({ text: 'Note supprimée', type: 'success' });
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentNote) await api.put(`/notes/${currentNote.id}`, noteForm);
      else await api.post('/notes', noteForm);
      fetchAllData();
      setShowNoteModal(false);
      setMessage({ text: currentNote ? 'Note modifiée' : 'Note ajoutée', type: 'success' });
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };

  // Impression relevé de classe (tous les étudiants, chaque étudiant une page)
  const printAllStudentReports = (classe) => {
    const classStudents = etudiants.filter(e => e.classe_id === classe.id);
    if (classStudents.length === 0) {
      alert('Aucun étudiant dans cette classe.');
      return;
    }
    const printWindow = window.open('', '_blank');
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bulletins - ${classe.nom}</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f0f2f5; }
          .page { page-break-after: always; min-height: 100vh; padding: 20px; background: white; margin: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 12px; }
          .page:last-child { page-break-after: auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e5; padding-bottom: 15px; }
          .school-name { font-size: 28px; font-weight: bold; color: #4f46e5; }
          .title { font-size: 22px; font-weight: bold; margin-top: 10px; }
          .info-section { background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); padding: 20px; border-radius: 16px; margin-bottom: 25px; border: 1px solid #e5e7eb; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .info-item { font-size: 14px; }
          .info-label { font-weight: bold; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .general-moy { margin-top: 20px; text-align: right; font-size: 16px; font-weight: bold; padding: 10px; background: #e0e7ff; border-radius: 8px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          @media print { body { background: white; } .page { margin: 0; box-shadow: none; border-radius: 0; } }
        </style>
      </head>
      <body>
    `;
    classStudents.forEach((etudiant) => {
      const studentNotes = notes.filter(n => n.etudiant_id === etudiant.id);
      const matieres = [...new Set(studentNotes.map(n => n.matiere))];
      let matieresWithData = matieres.map(m => {
        const notesMat = studentNotes.filter(n => n.matiere === m).map(n => parseFloat(n.note));
        const moyenne = notesMat.length ? (notesMat.reduce((a,b)=>a+b,0) / notesMat.length).toFixed(2) : '-';
        return { matiere: m, notes: notesMat, moyenne: moyenne };
      });
      const moyenneGenerale = studentNotes.length ? (studentNotes.reduce((sum, n) => sum + parseFloat(n.note), 0) / studentNotes.length).toFixed(2) : null;
      htmlContent += `
        <div class="page">
          <div class="header">
            <div class="school-name"> Mon Établissement Scolaire</div>
            <div class="title">BULLETIN DE NOTES</div>
            <div>Année scolaire 2025/2026</div>
          </div>
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Nom :</span> ${etudiant.nom || ''}</div>
              <div class="info-item"><span class="info-label">Prénom :</span> ${etudiant.prenom || ''}</div>
              <div class="info-item"><span class="info-label">Date de naissance :</span> ${etudiant.date_naissance || 'Non renseignée'}</div>
              <div class="info-item"><span class="info-label">Classe :</span> ${classe.nom} ${classe.niveau ? `(${classe.niveau})` : ''}</div>
            </div>
          </div>
          <h3 style="color:#4f46e5;">Résultats scolaires</h3>
          <table>
            <thead><tr><th>Matière</th><th>Notes</th><th>Moyenne /20</th></tr></thead>
            <tbody>
              ${matieresWithData.map(m => `
                <tr>
                  <td>${m.matiere}</td>
                  <td>${m.notes.join(', ')}</td>
                  <td class="subject-moy">${m.moyenne !== '-' ? m.moyenne + '/20' : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${moyenneGenerale ? `<div class="general-moy">Moyenne générale : ${moyenneGenerale} / 20</div>` : ''}
          <div class="footer">Document généré le ${new Date().toLocaleDateString()} - Cachet de l'établissement</div>
        </div>
      `;
    });
    htmlContent += `</body></html>`;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // ========== ABSENCES ==========
  const openAddAbsence = (etudiant) => {
    setCurrentEtudiant(etudiant);
    setCurrentAbsence(null);
    setAbsenceForm({
      etudiant_id: etudiant.id,
      date: new Date().toISOString().split('T')[0],
      nb_heures: 1,
      justifiee: false,
      enseignant_id: ''
    });
    setShowAbsenceModal(true);
  };
  const openEditAbsence = (absence) => {
    setCurrentAbsence(absence);
    const etudiant = etudiants.find(e => e.id === absence.etudiant_id);
    setCurrentEtudiant(etudiant);
    setAbsenceForm({
      date: absence.date ? absence.date.split('T')[0] : '',
      justifiee: absence.justifiee,
    });
    setShowAbsenceModal(true);
  };
  const handleDeleteAbsence = async (absId) => {
    if (!window.confirm('Supprimer cette absence ?')) return;
    try {
      await api.delete(`/absences/${absId}`);
      fetchAllData();
      setMessage({ text: 'Absence supprimée', type: 'success' });
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };
  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentAbsence) {
        await api.put(`/absences/${currentAbsence.id}`, {
          justifiee: absenceForm.justifiee
        });
      } else {
        await api.post('/absences', {
          etudiant_id: absenceForm.etudiant_id,
          date: absenceForm.date,
          nb_heures: parseFloat(absenceForm.nb_heures),
          justifiee: absenceForm.justifiee,
          enseignant_id: absenceForm.enseignant_id
        });
      }
      fetchAllData();
      setShowAbsenceModal(false);
      setMessage({ text: currentAbsence ? 'Absence modifiée' : 'Absence ajoutée', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur', type: 'error' });
    }
  };

  // ========== AFFECTATION ENSEIGNANT ↔ CLASSE ==========
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/classes/${assignForm.classe_id}/assign-teacher`, {
        enseignant_id: assignForm.enseignant_id
      });
      setMessage({ text: 'Enseignant affecté', type: 'success' });
      setShowAssignModal(false);
      fetchAllData();
    } catch (error) {
      setMessage({ text: 'Erreur affectation', type: 'error' });
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      setMessage({ text: 'Message supprimé', type: 'success' });
      fetchAllData();
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const etudiantsParClasse = useMemo(() => {
    if (!selectedClasse) return [];
    return etudiants.filter(e => e.classe_id === selectedClasse.id);
  }, [etudiants, selectedClasse]);

  const navItems = [
    { id: 'overview', label: 'Tableau de bord', icon: Home },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'classes', label: 'Classes', icon: GraduationCap },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'absences', label: 'Absences', icon: CalendarX },
    { id: 'assign', label: 'Affectation', icon: UserPlus },
    { id: 'contacts', label: 'Messages', icon: Mail },

  ];

  if (loading && !classes.length) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Toast */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message.text}
        </div>
      )}

      {/* Navbar élargie */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">Administration</span>
            </div>
            <div className="hidden md:flex gap-2 lg:gap-4">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === item.id ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <item.icon className="h-4 w-4" /> {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
              </button>
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2">
                  <div className="h-8 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">{user?.name?.charAt(0).toUpperCase()}</div>
                  <span className="text-sm font-medium hidden sm:inline text-gray-700 dark:text-gray-200">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border z-20">
                    <div className="px-4 py-2 border-b"><p className="text-sm font-medium dark:text-white">{user?.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p></div>
                    <button onClick={() => setShowPasswordModal(true)} className="w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700">Changer mot de passe</button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">Déconnexion</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Mobile nav */}
          <div className="md:hidden flex flex-wrap gap-2 py-2 overflow-x-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex items-center gap-1 px-3 py-1 rounded-md text-sm whitespace-nowrap text-gray-800 dark:text-white">
                <item.icon className="h-3 w-3" /> {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {/* ========== ONGLET TABLEAU DE BORD ========== */}
        {activeTab === 'overview' && (
          <div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Tableau de bord</h2>
              <p className="text-indigo-100">Statistiques globales de la plateforme</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 dark:text-gray-400 text-sm">Utilisateurs</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{etudiants.length + enseignants.length + administrateurs.length + usersNoRole.length}</p></div>
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full"><Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 dark:text-gray-400 text-sm">Étudiants</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{etudiants.length}</p></div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full"><GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 dark:text-gray-400 text-sm">Enseignants</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{enseignants.length}</p></div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full"><BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 dark:text-gray-400 text-sm">Administrateurs</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{administrateurs.length}</p></div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full"><Users className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 dark:text-gray-400 text-sm">Classes</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{classes.length}</p></div>
                  <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full"><GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 dark:text-gray-400 text-sm">Notes saisies</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{notes.length}</p></div>
                  <div className="bg-cyan-100 dark:bg-cyan-900 p-3 rounded-full"><BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 dark:text-gray-400 text-sm">Absences</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{absences.length}</p></div>
                  <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full"><CalendarX className="h-6 w-6 text-orange-600 dark:text-orange-400" /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 dark:text-gray-400 text-sm">Messages</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{contacts.length}</p></div>
                  <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-full"><Mail className="h-6 w-6 text-pink-600 dark:text-pink-400" /></div>
                </div>
              </div>
            </div>
            {usersNoRole.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full"><Users className="h-5 w-5 text-yellow-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Utilisateurs sans rôle</h3>
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs">{usersNoRole.length}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ces utilisateurs sont inscrits mais n’ont pas encore de rôle (étudiant, enseignant, administrateur). Vous pouvez leur attribuer un rôle depuis l’onglet « Utilisateurs ».</p>
              </div>
            )}
          </div>
        )}

        {/* ========== ONGLET UTILISATEURS ========== */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
              <p>Créer, modifier ou supprimer des comptes</p>
            </div>
            <div className="space-y-8">
              {/* Étudiants */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold dark:text-white">Étudiants</h3><button onClick={() => openAddUser('etudiant')} className="bg-green-500 text-white px-3 py-1 rounded flex gap-1"><Plus size={16} /> Ajouter</button></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr><th className="px-4 py-2 text-left dark:text-white">Nom</th><th className="px-4 py-2 text-left dark:text-white">Prénom</th><th className="px-4 py-2 text-left dark:text-white">Email</th><th className="px-4 py-2 text-left dark:text-white">Classe</th><th className="px-4 py-2 dark:text-white">Actions</th></tr>
                    </thead>
                    <tbody>
                      {etudiants.map(e => (
                        <tr key={e.id} className="border-b dark:border-gray-700">
                          <td className="px-4 py-2 dark:text-gray-200">{e.nom || e.user?.name?.split(' ')[0] || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{e.prenom || e.user?.name?.split(' ')[1] || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{e.user?.email || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{e.classe?.nom || '-'}</td>
                          <td className="px-4 py-2 flex gap-2"><button onClick={() => openEditUser('etudiant', e)} className="text-blue-500"><Edit size={16} /></button><button onClick={() => handleDeleteUser('etudiant', e.id)} className="text-red-500"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Enseignants */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold dark:text-white">Enseignants</h3><button onClick={() => openAddUser('enseignant')} className="bg-green-500 text-white px-3 py-1 rounded flex gap-1"><Plus size={16} /> Ajouter</button></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-2 text-left dark:text-white">Nom complet</th><th className="px-4 py-2 text-left dark:text-white">Email</th><th className="px-4 py-2 text-left dark:text-white">Matière</th><th className="px-4 py-2 dark:text-white">Actions</th></tr></thead>
                    <tbody>
                      {enseignants.map(e => (
                        <tr key={e.id} className="border-b dark:border-gray-700">
                          <td className="px-4 py-2 dark:text-gray-200">{e.user?.name || e.nom || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{e.user?.email || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{e.matiere || '-'}</td>
                          <td className="px-4 py-2 flex gap-2"><button onClick={() => openEditUser('enseignant', e)} className="text-blue-500"><Edit size={16} /></button><button onClick={() => handleDeleteUser('enseignant', e.id)} className="text-red-500"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Administrateurs */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold dark:text-white">Administrateurs</h3><button onClick={() => openAddUser('admin')} className="bg-green-500 text-white px-3 py-1 rounded flex gap-1"><Plus size={16} /> Ajouter</button></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-2 text-left dark:text-white">Nom complet</th><th className="px-4 py-2 text-left dark:text-white">Email</th><th className="px-4 py-2 dark:text-white">Actions</th></tr></thead>
                    <tbody>
                      {administrateurs.map(a => (
                        <tr key={a.id} className="border-b dark:border-gray-700">
                          <td className="px-4 py-2 dark:text-gray-200">{a.user?.name || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{a.user?.email || '-'}</td>
                          <td className="px-4 py-2 flex gap-2"><button onClick={() => openEditUser('admin', a)} className="text-blue-500"><Edit size={16} /></button><button onClick={() => handleDeleteUser('administrateur', a.id)} className="text-red-500"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Utilisateurs sans rôle */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Utilisateurs sans rôle (à assigner)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-2 text-left dark:text-white">Nom</th><th className="px-4 py-2 text-left dark:text-white">Email</th><th className="px-4 py-2 dark:text-white">Actions</th></tr></thead>
                    <tbody>
                      {usersNoRole.map(u => (
                        <tr key={u.id} className="border-b dark:border-gray-700">
                          <td className="px-4 py-2 dark:text-gray-200">{u.name}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{u.email}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <button onClick={() => { setSelectedExistingUser(u.id); openAddUser('etudiant'); }} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Assigner étudiant</button>
                            <button onClick={() => { setSelectedExistingUser(u.id); openAddUser('enseignant'); }} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Assigner enseignant</button>
                            <button onClick={() => { setSelectedExistingUser(u.id); openAddUser('admin'); }} className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Assigner admin</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== ONGLET CLASSES ========== */}
        {activeTab === 'classes' && (
          <div>
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Gestion des classes</h2>
              <p>Liste des classes et étudiants</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4"><button onClick={openAddClasse} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex gap-1 transition"><Plus size={16} /> Nouvelle classe</button></div>
              <div className="grid grid-cols-1 gap-4">
                {classes.map(classe => (
                  <div key={classe.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 cursor-pointer flex justify-between items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition" onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)}>
                      <div><h4 className="text-lg font-bold dark:text-white">{classe.nom} {classe.niveau ? `(${classe.niveau})` : ''}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{etudiants.filter(e => e.classe_id === classe.id).length} étudiants</p></div>
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 cursor-pointer" />
                        <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDeleteClasse(classe.id); }} />
                      </div>
                    </div>
                    {selectedClasse?.id === classe.id && (
                      <div className="p-4 space-y-2 bg-white dark:bg-gray-800">
                        {etudiantsParClasse.map(etudiant => (
                          <div key={etudiant.id} className="p-2 border rounded dark:border-gray-700"><p className="font-medium dark:text-white">{etudiant.nom} {etudiant.prenom}</p></div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== ONGLET NOTES ========== */}
        {activeTab === 'notes' && (
          <div>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Gérer les notes</h2>
              <p>Choisir une classe, gérer les notes des étudiants et imprimer les relevés individuels</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h4 className="text-lg font-semibold mb-4 dark:text-white">Choisir une classe</h4>
              {classes.map(classe => (
                <div key={classe.id} className="border rounded-lg mb-3">
                  <button onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)} className="w-full flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="font-medium dark:text-white">{classe.nom} {classe.niveau ? `(${classe.niveau})` : ''}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                  {selectedClasse?.id === classe.id && (
                    <div className="border-t p-4 bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold dark:text-white">Étudiants</h4>
                        <button onClick={() => printAllStudentReports(selectedClasse)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Printer size={14}/> Imprimer tous les bulletins</button>
                      </div>
                      {etudiantsParClasse.map(etudiant => (
                        <div key={etudiant.id} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold dark:text-white">{etudiant.nom} {etudiant.prenom}</span>
                            <button onClick={() => openAddNote(etudiant)} className="bg-green-500 text-white px-2 py-1 rounded text-sm">+ Note</button>
                          </div>
                          <StudentNotesList notes={notes.filter(n => n.etudiant_id === etudiant.id)} onEdit={openEditNote} onDelete={handleDeleteNote} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ONGLET ABSENCES ========== */}
        {activeTab === 'absences' && (
          <div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Gérer les absences</h2>
              <p>Choisir une classe, gérer les absences des étudiants</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h4 className="text-lg font-semibold mb-4 dark:text-white">Choisir une classe</h4>
              {classes.map(classe => (
                <div key={classe.id} className="border rounded-lg mb-3">
                  <button onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)} className="w-full flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="font-medium dark:text-white">{classe.nom} {classe.niveau ? `(${classe.niveau})` : ''}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                  {selectedClasse?.id === classe.id && (
                    <div className="border-t p-4 bg-gray-50 dark:bg-gray-700/30">
                      {etudiantsParClasse.map(etudiant => (
                        <div key={etudiant.id} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold dark:text-white">{etudiant.nom} {etudiant.prenom}</span>
                          </div>
                          <StudentAbsencesList absences={absences.filter(a => a.etudiant_id === etudiant.id)} onEdit={openEditAbsence} onDelete={handleDeleteAbsence} formatDate={formatDate} enseignants={enseignants} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ONGLET CONTACTS ========== */}
        {activeTab === 'contacts' && (
          <div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Messages de contact</h2>
              <p>Consulter et supprimer</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
              {contacts.length === 0 ? <p className="dark:text-gray-300">Aucun message.</p> : contacts.map(c => (
                <div key={c.id} className="border-b pb-3">
                  <div className="flex justify-between"><div><span className="font-semibold dark:text-white">{c.nom}</span> ({c.email})</div><button onClick={() => handleDeleteContact(c.id)} className="text-red-500"><Trash2 size={16} /></button></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Sujet:</strong> {c.sujet}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{c.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ONGLET AFFECTATION ========== */}
        {activeTab === 'assign' && (
          <div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold">Affectation des enseignants aux classes</h2>
              <p>Assigner un enseignant à une classe</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <button onClick={() => setShowAssignModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg mb-4">Nouvelle affectation</button>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr><th className="px-4 py-2 text-left dark:text-white">Classe</th><th className="px-4 py-2 text-left dark:text-white">Enseignant(s)</th><th className="px-4 py-2 dark:text-white">Actions</th></tr>
                  </thead>
                  <tbody>
                    {classes.map(c => {
                      const enseignantsList = c.enseignants || [];
                      const enseignantsNoms = enseignantsList.map(e => e.nom).join(', ');
                      return (
                        <tr key={c.id} className="border-b dark:border-gray-700">
                          <td className="px-4 py-2 dark:text-gray-200">{c.nom} {c.niveau ? `(${c.niveau})` : ''}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{enseignantsNoms || 'Non affecté'}</td>
                          <td className="px-4 py-2"><button onClick={() => { const firstId = enseignantsList.length > 0 ? enseignantsList[0].id : ''; setAssignForm({ classe_id: c.id, enseignant_id: firstId }); setShowAssignModal(true); }} className="text-blue-500">Modifier</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========== MODALES ========== */}

      {/* Modale utilisateur */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold dark:text-white">{currentUser ? 'Modifier' : 'Ajouter'} {userModalType === 'etudiant' ? 'étudiant' : userModalType === 'enseignant' ? 'enseignant' : 'administrateur'}</h3><button onClick={() => setShowUserModal(false)}><X className="dark:text-white" /></button></div>
            {!currentUser && usersNoRole.length > 0 && (<div className="mb-4"><label className="block text-sm font-medium dark:text-gray-300">Ou sélectionner un utilisateur existant</label><select value={selectedExistingUser} onChange={e => setSelectedExistingUser(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"><option value="">-- Créer un nouvel utilisateur --</option>{usersNoRole.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</select></div>)}
            <form onSubmit={handleUserSubmit} className="space-y-3">
              <input type="text" placeholder="Nom *" value={userForm.nom} onChange={e => setUserForm({ ...userForm, nom: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />
              <input type="text" placeholder="Prénom" value={userForm.prenom} onChange={e => setUserForm({ ...userForm, prenom: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required={userModalType === 'etudiant'} />
              {!selectedExistingUser && (<><input type="email" placeholder="Email *" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />{!currentUser && <input type="password" placeholder="Mot de passe *" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />}</>)}
              {userModalType === 'enseignant' && <input type="text" placeholder="Matière *" value={userForm.matiere} onChange={e => setUserForm({ ...userForm, matiere: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />}
              {userModalType === 'etudiant' && (<><select value={userForm.classe_id} onChange={e => setUserForm({ ...userForm, classe_id: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required><option value="">Choisir une classe *</option>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select><input type="date" placeholder="Date de naissance" value={userForm.date_naissance} onChange={e => setUserForm({ ...userForm, date_naissance: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" /></>)}
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowUserModal(false)} className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded dark:text-white">Annuler</button><button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modale classe */}
      {showClasseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{currentClasse ? 'Modifier' : 'Ajouter'} une classe</h3>
            <form onSubmit={handleClasseSubmit} className="space-y-3">
              <input type="text" placeholder="Nom *" value={classeForm.nom} onChange={e => setClasseForm({ ...classeForm, nom: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />
              <input type="text" placeholder="Niveau" value={classeForm.niveau} onChange={e => setClasseForm({ ...classeForm, niveau: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" />
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowClasseModal(false)} className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded dark:text-white">Annuler</button><button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modale note */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{currentNote ? 'Modifier' : 'Ajouter'} une note</h3>
            <form onSubmit={handleNoteSubmit} className="space-y-3">
              <input type="text" placeholder="Matière *" value={noteForm.matiere} onChange={e => setNoteForm({ ...noteForm, matiere: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />
              <input type="number" step="0.1" min="0" max="20" placeholder="Note" value={noteForm.note} onChange={e => setNoteForm({ ...noteForm, note: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowNoteModal(false)} className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded dark:text-white">Annuler</button><button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modale absence */}
      {showAbsenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{currentAbsence ? 'Modifier' : 'Ajouter'} une absence</h3>
            <form onSubmit={handleAbsenceSubmit} className="space-y-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded"><span className="font-semibold dark:text-white">Étudiant :</span> <span className="dark:text-gray-200">{currentEtudiant?.nom} {currentEtudiant?.prenom}</span></div>
              <input type="date" value={absenceForm.date || ''} onChange={e => setAbsenceForm({...absenceForm, date: e.target.value})} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required readOnly={currentAbsence ? true : false} />
              {!currentAbsence && (
                <input type="number" step="0.5" placeholder="Heures" value={absenceForm.nb_heures} onChange={e => setAbsenceForm({...absenceForm, nb_heures: parseFloat(e.target.value)})} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />
              )}
              <label className="flex items-center gap-2 dark:text-gray-200">
                <input type="checkbox" checked={absenceForm.justifiee} onChange={e => setAbsenceForm({...absenceForm, justifiee: e.target.checked})} /> Justifiée
              </label>
              {!currentAbsence && (
                <select value={absenceForm.enseignant_id} onChange={e => setAbsenceForm({...absenceForm, enseignant_id: e.target.value})} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required>
                  <option value="">Choisir un enseignant</option>
                  {enseignants.map(ens => <option key={ens.id} value={ens.id}>{ens.nom} ({ens.matiere})</option>)}
                </select>
              )}
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowAbsenceModal(false)} className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded dark:text-white">Annuler</button><button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modale affectation */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Affecter un enseignant</h3>
            <form onSubmit={handleAssignTeacher} className="space-y-3">
              <select value={assignForm.classe_id} onChange={e => setAssignForm({ ...assignForm, classe_id: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required><option value="">Choisir une classe</option>{classes.map(c => <option key={c.id} value={c.id}>{c.nom} {c.niveau ? `(${c.niveau})` : ''}</option>)}</select>
              <select value={assignForm.enseignant_id} onChange={e => setAssignForm({ ...assignForm, enseignant_id: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required><option value="">Choisir un enseignant</option>{enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.matiere})</option>)}</select>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowAssignModal(false)} className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded dark:text-white">Annuler</button><button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Affecter</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modale changement mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold dark:text-white">Changer mot de passe</h3><button onClick={() => setShowPasswordModal(false)}><X className="dark:text-white" /></button></div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input type="password" placeholder="Mot de passe actuel" value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />
              <input type="password" placeholder="Nouveau mot de passe" value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />
              <input type="password" placeholder="Confirmation" value={passwordForm.new_password_confirmation} onChange={e => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" required />
              {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}{passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowPasswordModal(false)} className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded dark:text-white">Annuler</button><button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Modifier</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}