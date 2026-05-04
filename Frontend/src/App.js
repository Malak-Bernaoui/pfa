import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/LoginPage/Login';
import Register from './Pages/Inscription/Inscription';
import Accueil from './Pages/Accueil/Accueil';
import AdminDashboard from './Pages/Administrateur/AdminDashboard';
import EnseignantDashboard from './Pages/Enseignant/EnseignantDashboard';
import EtudiantDashboard from './Pages/Etudiant/EtudiantDashboard';



// Composant pour protéger les routes (optionnel)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Accueil" element={<ProtectedRoute><Accueil/></ProtectedRoute>} />
        <Route path="/administrateurs" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/enseignant/:id" element={<ProtectedRoute><EnseignantDashboard /></ProtectedRoute>} />
        <Route path="/etudiant/:id" element={<ProtectedRoute><EtudiantDashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;