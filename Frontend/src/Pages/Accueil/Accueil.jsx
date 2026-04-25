// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  Phone,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronDown,
  School,
  Clock,
  FileText,
  Award,
  Shield,
  GraduationCap,
  Mail,
  PhoneCall,
  MapPin
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [classes, setClasses] = useState([]);
  const [contactForm, setContactForm] = useState({ sujet: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setContactStatus({ type: '', message: '' });
    try {
      await api.post('/contact', contactForm);
      setContactStatus({ type: 'success', message: 'Votre message a bien été envoyé.' });
      setContactForm({ sujet: '', message: '' });
    } catch (error) {
      console.error(error);
      setContactStatus({ type: 'error', message: "Erreur lors de l'envoi. Veuillez réessayer." });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/classes');
        setClasses(response.data);
      } catch (error) {
        console.error('Erreur chargement des classes', error);
      }
    };
    fetchClasses();
  }, []);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Bienvenue, {user?.name} </h2>
              <p className="text-indigo-100">Plateforme de gestion scolaire </p>
            </div>


            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <School className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Notre École</h3>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
                <p>
                  Fondée en 2005, <span className="font-semibold">Lycée Moderne de l'Innovation</span> est un établissement d'enseignement général et technologique
                  reconnu pour son excellence académique et son accompagnement personnalisé. Nous accueillons plus de <strong>1 200 élèves</strong>
                  de la 6ème à la Terminale, répartis dans des classes à effectifs réduits pour garantir un suivi individualisé.
                </p>
                <p>
                  <strong>Notre système de fonctionnement</strong> repose sur trois piliers :
                  l'<strong>innovation pédagogique</strong> (classes numériques, plateforme e-learning),
                  le <strong>suivi personnalisé</strong> (tutorat, conseils de classe trimestriels) et
                  l'<strong>épanouissement extrascolaire</strong> (clubs, sports, sorties culturelles).
                </p>
                <p>
                  Grâce à notre plateforme en ligne, les étudiants, enseignants et parents peuvent consulter
                  en temps réel les notes, absences, emplois du temps et ressources pédagogiques.
                  L'administration assure une gestion transparente et sécurisée des données.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <GraduationCap className="h-5 w-5 text-indigo-500" />
                    <span>98% de réussite </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Users className="h-5 w-5 text-indigo-500" />
                    <span>+ de 80 enseignants qualifiés</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Award className="h-5 w-5 text-indigo-500" />
                    <span>Labellisé "École numérique"</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        );

      case 'schedule':
        const slots = [
          { label: '08:00 - 09:30', duration: '1h30' },
          { label: '09:45 - 11:15', duration: '1h30' },
          { label: '11:30 - 13:00', duration: '1h30' },
          { label: '14:00 - 15:30', duration: '1h30' },
          { label: '15:45 - 17:15', duration: '1h30' },
        ];
        const scheduleGrid = {
          lundi: [

            { subject: 'Java', room: 'A103' },
            { subject: 'Agile', room: 'B202' },
            { subject: 'Cloud Computing', room: 'Lab 3' },
            { subject: 'Anglais', room: 'C101' },
            { subject: 'Linux', room: 'Lab 2' },
          ],
          mardi: [
            { subject: 'React', room: 'A105' },
            { subject: 'POO (Java)', room: 'A103' },
            { subject: 'Bases de données (SQL)', room: 'Lab 1' },
            { subject: 'Français', room: 'C102' },
            { subject: 'Docker', room: 'Lab 3' },
          ],
          mercredi: [
            { subject: 'Laravel', room: 'A105' },
            { subject: 'Angular', room: 'A107' },
            { subject: 'Entrepreneuriat', room: 'C201' },
            { subject: 'JEE', room: 'A103' },
            { subject: 'NoSQL (MongoDB)', room: 'Lab 1' },
          ],
          jeudi: [
            { subject: 'Cloud Computing (TP)', room: 'Lab 3' },
            { subject: 'React (TP)', room: 'Lab 2' },
            { subject: 'Anglais (Projet)', room: 'C101' },
            { subject: 'Linux (Scripting)', room: 'Lab 2' },
            { subject: 'POO (Avancé)', room: 'A103' },
          ],
          vendredi: [
            { subject: 'Agile (Scrum)', room: 'B202' },
            { subject: 'Laravel (API)', room: 'A105' },
            { subject: 'Français (Rédaction)', room: 'C102' },
            { subject: 'JEE (Spring)', room: 'A103' },
            { subject: 'Docker (CI/CD)', room: 'Lab 3' },
          ],
          samedi: [
            { subject: 'Entrepreneuriat (Projet)', room: 'C201' },
            { subject: 'Angular (Composants)', room: 'A107' },
            { subject: 'Bases de données (SQL avancé)', room: 'Lab 1' },
            { subject: 'NoSQL (TP)', room: 'Lab 1' },
            { subject: 'Cloud (Déploiement)', room: 'Lab 3' },
          ],
        };

        const days = [
          { key: 'lundi', label: 'Lundi' },
          { key: 'mardi', label: 'Mardi' },
          { key: 'mercredi', label: 'Mercredi' },
          { key: 'jeudi', label: 'Jeudi' },
          { key: 'vendredi', label: 'Vendredi' },
          { key: 'samedi', label: 'Samedi' },
        ];

        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Emploi du temps</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Semaine du 24 avril 2026</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 dark:bg-gray-700/50 z-10 px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Horaires / Jours</th>
                    {days.map(day => (
                      <th key={day.key} className="px-3 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {slots.map((slot, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 z-10 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">
                        {slot.label}
                        <span className="block text-xs text-gray-400">{slot.duration}</span>
                      </td>
                      {days.map(day => {
                        const course = scheduleGrid[day.key]?.[idx];
                        return (
                          <td key={day.key} className="px-3 py-3 align-top text-center">
                            {course ? (
                              <div className="rounded-lg p-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                <div className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">{course.subject}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Salle {course.room}</div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-300 dark:text-gray-600 italic">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50">
              <span className="inline-flex items-center gap-2"><span className="inline-block w-3 h-3 bg-indigo-200 dark:bg-indigo-800 rounded"></span> Cours présentiel</span>
            </div>
          </div>
        );
      case 'groups':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Classes et effectifs</h2>
            {classes.length === 0 ? (
              <p className="text-gray-500">Aucune classe disponible.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((classe) => (
                  <div key={classe.id} className="border rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{classe.nom}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{classe.etudiants_count || 0} étudiants</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'regulations':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Règlement intérieur</h2>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Shield className="h-5 w-5" /> Préambule</h3>
                <p>Le présent règlement intérieur s'applique à tous les membres de la communauté éducative. Il a pour but de garantir un climat scolaire serein, respectueux et propice aux apprentissages.</p>
              </div>

              <h3 className="text-lg font-semibold mt-4">Article 1 – Assiduité et ponctualité</h3>
              <p>La présence à tous les cours, travaux pratiques et examens est obligatoire. Tout retard ou absence doit être justifié dans les 48 heures par un billet des parents ou un certificat médical. Au-delà de 3 absences non justifiées par trimestre, une mesure disciplinaire peut être prise.</p>

              <h3 className="text-lg font-semibold mt-4">Article 2 – Respect du matériel et des locaux</h3>
              <p>Les salles de classe, laboratoires, bibliothèque et équipements informatiques sont mis à disposition des élèves. Toute dégradation volontaire entraînera une réparation à la charge de l'élève ou de ses responsables légaux. Les poubelles doivent être utilisées pour préserver la propreté.</p>

              <h3 className="text-lg font-semibold mt-4">Article 3 – Utilisation des appareils électroniques</h3>
              <p>Le téléphone portable est strictement interdit pendant les cours, les évaluations et les études surveillées. Il doit être éteint ou en mode silencieux et rangé dans le sac. La première infraction entraîne un avertissement, la seconde une confiscation jusqu'à la fin de la journée, la troisième une convocation des parents.</p>

              <h3 className="text-lg font-semibold mt-4">Article 4 – Tenue vestimentaire et comportement</h3>
              <p>Une tenue correcte et décente est exigée. Sont interdits : les vêtements à messages provocateurs, les casquettes, les tenues de plage. Le respect mutuel entre élèves, enseignants et personnel est fondamental. Tout comportement violent, harcèlement ou discrimination sera sanctionné conformément à la loi.</p>

              <h3 className="text-lg font-semibold mt-4">Article 5 – Sanctions disciplinaires</h3>
              <p>En fonction de la gravité des faits, les sanctions suivantes peuvent être appliquées : avertissement, blâme, exclusion temporaire (1 à 8 jours), exclusion définitive. Les décisions sont prises par le conseil de discipline après audition de l'élève.</p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-6">
                <p className="italic">"Le règlement intérieur est accepté par chaque élève et sa famille lors de l'inscription. Toute infraction engage la responsabilité de l'élève."</p>
                <p className="text-right text-sm mt-2">La direction</p>
              </div>
            </div>
          </div>
        );

      case 'contact':
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Contactez-nous</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Sujet</label>
              <input
                type="text"
                name="sujet"
                value={contactForm.sujet}
                onChange={handleContactChange}
                required
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Message</label>
              <textarea
                name="message"
                rows="4"
                value={contactForm.message}
                onChange={handleContactChange}
                required
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            {contactStatus.message && (
              <div className={`p-2 rounded ${contactStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {contactStatus.message}
              </div>
            )}
            <button
              type="submit"
              disabled={sending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {sending ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        </div>
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-500" />
            <span>123 Avenue de l'École, 75001 Casablanca</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-indigo-500" />
            <span>+212 22 25 34 56</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-500" />
            <span>contact@ecolemoderne.fr</span>
          </div>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-semibold">Horaires d'ouverture :</p>
            <p>Lundi - Samedi : 8h00 - 18h00</p>
          </div>
        </div>
      </div>
    </div>
  );
      default:
        return null;
    }
  };
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'schedule', label: 'Emploi du temps', icon: Calendar },
    { id: 'groups', label: 'Groupes étudiants', icon: Users },
    { id: 'regulations', label: 'Règlement intérieur', icon: BookOpen },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <School className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Mon École</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right side: theme toggle + user dropdown */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
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
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border dark:border-gray-700">
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation (horizontal scroll) */}
        <div className="md:hidden border-t dark:border-gray-700 overflow-x-auto">
          <div className="flex space-x-2 px-4 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-3 py-1 rounded-md text-sm whitespace-nowrap ${activeTab === item.id
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-300'
                  }`}
              >
                <item.icon className="h-4 w-4 mr-1" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}