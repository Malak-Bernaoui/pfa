// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mt-2">Page non trouvée</p>
        <p className="text-gray-500 mt-4">Vous n'avez pas l'autorisation d'accéder à cette page ou elle n'existe pas.</p>
        
      </div>
    </div>
  );
}