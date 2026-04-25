import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.includes('@') || password.length < 6) {
      setErrorMessage('Veuillez remplir correctement les champs.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.post('/login', { email, password });
      const { token, user, redirect } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirection basée sur le type détecté
      switch (redirect.type) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'enseignant':
          navigate(`/enseignant/${redirect.id}`);
          break;
        case 'etudiant':
          navigate(`/etudiant/${redirect.id}`);
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.errors?.email?.[0] 
                  || error.response?.data?.message 
                  || 'Erreur de connexion.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-12">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
          <h2 className="text-3xl font-bold text-white text-center tracking-tight">
            Connexion
          </h2>
          <p className="text-gray-300 text-center text-sm mt-2">
            Accédez à votre compte
          </p>
        </div>

        {/* Form Body */}
        <div className="px-8 py-8 space-y-6">
          {errorMessage && (
            <div className="bg-red-50 text-red-800 border border-red-200 text-sm px-4 py-3 rounded-xl text-center font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                placeholder="exemple@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 flex justify-center items-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Connexion en cours...</span>
              </>
            ) : (
              "Se connecter"
            )}
          </button>

          <p className="text-sm text-center text-gray-500 pt-2">
            Vous n'avez pas de compte ?{" "}
            <a href="/register" className="font-semibold text-gray-800 hover:text-gray-600 hover:underline">
              S'inscrire
            </a>
          </p>
        </div>

        {/* Footer note */}
        <div className="bg-gray-50 px-8 py-3 text-center text-xs text-gray-400 border-t border-gray-100">
          Connexion sécurisée à votre espace personnel
        </div>
      </form>
    </div>
  );
}