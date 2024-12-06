import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-blue-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo ou Titre */}
        <h1 className="text-2xl font-bold">
          <Link to="/">Qooldown</Link>
        </h1>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="font-bold">
                Antoine D.
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:underline">
                &
              </Link>
            </li>
            <li>
              <Link to="/" className="font-bold">
                Muyao C.
              </Link>
            </li>
          </ul>
        </nav>

        {/* Bouton de connexion/déconnexion */}
        <div>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 mx-5"
          >
            Inscription
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 mx-5"
          >
            Connexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
