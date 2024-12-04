import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-blue-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo ou Titre */}
        <h1 className="text-2xl font-bold">
          <Link to="/">Agile Retro</Link>
        </h1>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:underline">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/retro/123" className="hover:underline">
                Exemple de Rétrospective
              </Link>
            </li>
          </ul>
        </nav>

        {/* Bouton de connexion/déconnexion */}
        <div>
          <button
            onClick={() => alert("Connexion/Déconnexion")}
            className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100"
          >
            Connexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
