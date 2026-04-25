import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import {
  User,
  BookOpen,
  CalendarX,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  GraduationCap,
  Calendar,
  Key,
  X,
  Printer,
  FileText
} from 'lucide-react';

export default function EtudiantDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [etudiant, setEtudiant] = useState(null);
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [activeTab, setActiveTab] = useState('profil');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const totalHeures = absences.reduce((sum, a) => sum + (a.nb_heures || 0), 0);

  const calculerMoyenne = () => {
    if (notes.length === 0) return null;
    const somme = notes.reduce((acc, note) => acc + parseFloat(note.note), 0);
    return (somme / notes.length).toFixed(2);
  };
  const moyenneGenerale = calculerMoyenne();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getAppreciation = () => {
    if (moyenneGenerale === null) return "Aucune note enregistrée.";
    const moyenne = parseFloat(moyenneGenerale);
    if (moyenne >= 16) return "Excellent travail !";
    if (moyenne >= 14) return "Très bien, encourageant.";
    if (moyenne >= 12) return "Bon, peut mieux faire.";
    if (moyenne >= 10) return "Moyen, des progrès nécessaires.";
    return "Insuffisant, une remise à niveau est conseillée.";
  };

  const getAbsenceAppreciation = () => {
    if (totalHeures === 0) return "Assiduité parfaite.";
    if (totalHeures <= 5) return "Quelques absences, à surveiller.";
    if (totalHeures <= 15) return "Absences fréquentes, justifier impérativement.";
    return "Trop d'absences, risque de non validation.";
  };

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
        console.error('Erreur chargement données étudiant', error);
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
      console.error('Erreur déconnexion', error);
    }
  };

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
      const msg = error.response?.data?.message || 'Erreur lors du changement de mot de passe.';
      setPasswordError(msg);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relevé étudiant - ${etudiant?.prenom} ${etudiant?.nom}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 40px;
            color: #333;
            line-height: 1.5;
            background: white;
          }
          .print-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #4f46e5;
          }
          .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            background: #f3f4f6;
            padding: 8px 15px;
            border-left: 5px solid #4f46e5;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
          }
          .info-item {
            font-size: 15px;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
            display: inline-block;
            width: 140px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .moyenne {
            margin-top: 20px;
            padding: 10px;
            background-color: #e0e7ff;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            font-size: 18px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            .print-container {
              max-width: 100%;
            }
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <div class="title">Mon Établissement Scolaire</div>
            <div class="subtitle">Relevé d'informations étudiant</div>
          </div>
          <div class="section">
            <div class="section-title">Informations personnelles</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Nom :</span> ${etudiant?.nom || ''}</div>
              <div class="info-item"><span class="info-label">Prénom :</span> ${etudiant?.prenom || ''}</div>
              <div class="info-item"><span class="info-label">Date de naissance :</span> ${formatDate(etudiant?.date_naissance)}</div>
              <div class="info-item"><span class="info-label">Classe :</span> ${etudiant?.classe?.nom || 'Non définie'}</div>
              <div class="info-item"><span class="info-label">Email :</span> ${user?.email || ''}</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Relevé de notes</div>
            ${notes.length === 0 ? '<p>Aucune note disponible.</p>' : `
              <table>
                <thead><tr><th>Matière</th><th>Note /20</th></tr></thead>
                <tbody>
                  ${notes.map(n => `<tr><td>${n.matiere}</td><td>${n.note}</td></tr>`).join('')}
                </tbody>
              </table>
              ${moyenneGenerale ? `<div class="moyenne">Moyenne générale : ${moyenneGenerale} / 20</div>` : ''}
            `}
          </div>
          <div class="section">
            <div class="section-title">Absences</div>
            ${absences.length === 0 ? '<p>Aucune absence enregistrée.</p>' : `
              <table>
                <thead><tr><th>Date</th><th>Matière</th><th>Heures</th><th>Justification</th></tr></thead>
                <tbody>
                  ${absences.map(a => `
                    <tr>
                      <td>${formatDate(a.date)}</td>
                      <td>${a.enseignant?.matiere || 'Non spécifiée'}</td>
                      <td>${a.nb_heures} h</td>
                      <td>${a.justifiee ? 'Justifiée' : 'Non justifiée'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <p style="margin-top: 15px; text-align: right; font-weight: bold;">
                Total des heures : ${totalHeures} h
              </p>
            `}
          </div>
          <div class="footer">
            Document généré le ${new Date().toLocaleDateString()} - Plateforme scolaire
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Impression de l'attestation scolaire enrichie (sans email)
  const handlePrintAttestation = () => {
    const printWindow = window.open('', '_blank');
    const date = new Date();
    const formattedDate = date.toLocaleDateString('fr-FR');
    const anneeScolaire = "2025/2026";
    const numAttestation = `ATS-${etudiant?.id}-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}`;
    const appreciationNotes = getAppreciation();
    const appreciationAbsences = getAbsenceAppreciation();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attestation scolaire - ${etudiant?.prenom} ${etudiant?.nom}</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            margin: 50px;
            line-height: 1.5;
            color: #000;
            background: white;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #aaa;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            margin-bottom: 30px;
            padding-bottom: 10px;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            text-decoration: underline;
          }
          .content {
            margin: 20px 0;
          }
          .info {
            margin: 8px 0;
          }
          .signature {
            margin-top: 50px;
            text-align: right;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          .remark {
            margin-top: 20px;
            font-style: italic;
            background: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #4f46e5;
          }
          .cachet {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            font-style: italic;
          }
          .num {
            text-align: right;
            font-size: 11px;
            color: #555;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            margin: 10px 0;
            border-collapse: collapse;
          }
          td, th {
            border: 1px solid #ddd;
            padding: 6px;
          }
          th {
            background: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="num">N° ${numAttestation}</div>
          <div class="header">
            <div class="school-name"> Établissement Scolaire</div>
            <div>Année scolaire ${anneeScolaire}</div>
          </div>
          <div class="title">ATTESTATION DE SCOLARITÉ</div>
          <div class="content">
            <p>Je soussigné(e), Directeur de l'établissement, certifie que l'élève :</p>
            <div class="info"><strong>Nom :</strong> ${etudiant?.nom || ''}</div>
            <div class="info"><strong>Prénom :</strong> ${etudiant?.prenom || ''}</div>
            <div class="info"><strong>Date de naissance :</strong> ${formatDate(etudiant?.date_naissance)}</div>
            <div class="info"><strong>Classe :</strong> ${etudiant?.classe?.nom || 'Non définie'}</div>
   
            
            <p>est régulièrement inscrit(e) dans notre établissement pour l'année scolaire ${anneeScolaire}.</p>
            
            <div class="remark">
               <strong>Remarque administrative :</strong> La présente attestation est délivrée pour justifier de la situation scolaire de l'élève auprès des autorités compétentes. Toute falsification de ce document est passible de sanctions conformément à la loi.
            </div>
          </div>
          <div class="signature">
            Fait à Casablanca,<br/>
            Le ${formattedDate}<br/>
            <strong>Le Directeur</strong>
            <div class="cachet">Cachet de l'établissement</div>
          </div>
          <div class="footer">
            Document généré par la plateforme scolaire - ${formattedDate}
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold">Mon profil</h2>
              <p className="text-indigo-100">Informations personnelles et scolaires</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                    {etudiant?.prenom?.charAt(0)}{etudiant?.nom?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {etudiant?.prenom} {etudiant?.nom}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">Étudiant</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-500">Date de naissance</p>
                  <p className="font-medium text-gray-600 dark:text-gray-300">{formatDate(etudiant?.date_naissance) || 'Non renseignée'}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-500">Classe</p>
                  <p className="font-medium text-gray-600 dark:text-gray-300">{etudiant?.classe?.nom || 'Non définie'}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-500">Email</p>
                  <p className="font-medium text-gray-600 dark:text-gray-300">{user?.email}</p>
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
        );
      case 'notes':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold">Mes notes</h2>
              <p className="text-green-100">Relevé de notes</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune note disponible pour le moment.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Matière</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Note /20</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notes.map((note) => (
                          <tr key={note.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{note.matiere}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-semibold ${parseFloat(note.note) >= 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {note.note}/20
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {moyenneGenerale && (
                    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-center">
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Moyenne générale : <span className="text-indigo-600 dark:text-indigo-400 text-2xl font-bold">{moyenneGenerale}</span> / 20
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      case 'absences':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold">Mes absences</h2>
              <p className="text-orange-100">Suivi des présences</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              {absences.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CalendarX className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune absence enregistrée.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Matière</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Heures</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Justification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {absences.map((abs) => (
                          <tr key={abs.id}>
                            <td className="px-4 py-3 text-sm dark:text-gray-300">{formatDate(abs.date)}</td>
                            <td className="px-4 py-3 text-sm dark:text-gray-300">{abs.enseignant?.matiere || 'Non spécifiée'}</td>
                            <td className="px-4 py-3 text-sm dark:text-gray-300">{abs.nb_heures} h</td>
                            <td className="px-4 py-3 text-sm dark:text-gray-300">
                              {abs.justifiee ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Justifiée
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Non justifiée
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                    Total des heures : {totalHeures} h
                  </p>
                </>
              )}
            </div>
          </div>
        );
      case 'attestation':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold">Attestation scolaire</h2>
              <p className="text-blue-100">Imprimer votre attestation officielle</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  L'attestation inclura vos informations personnelles, votre classe, ainsi que les mentions légales nécessaires pour justifier de votre scolarité auprès des autorités compétentes. Veuillez vérifier que vos informations sont à jour avant d'imprimer.
                </p>
                <button
                  onClick={handlePrintAttestation}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Imprimer l'attestation (PDF)
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!etudiant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'profil', label: 'Mon profil', icon: User },
    { id: 'notes', label: 'Mes notes', icon: BookOpen },
    { id: 'absences', label: 'Mes absences', icon: CalendarX },
    { id: 'attestation', label: 'Attestation', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Espace Étudiant</span>
            </div>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" /> {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Mode sombre"
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
              <button
                onClick={handlePrint}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Imprimer le relevé"
              >
                <Printer className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border dark:border-gray-700">
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:hidden flex flex-wrap gap-2 py-3 border-t dark:border-gray-700">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-3 py-1 rounded-md text-sm ${
                  activeTab === item.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <item.icon className="h-4 w-4 mr-1" /> {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Confirmation</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600"
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                />
              </div>
              {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition">
                Modifier
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}