import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold mb-4">Bienvenue dans Agile Retro</h1>
      <Link
        to="/create-template"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Créer un template
      </Link>
      <Link
        to="/retro/123"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Créer une rétrospective
      </Link>
      <Link
        to="/retroList"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Accéder à une rétrospective
      </Link>
    </div>
  );
};

export default Home;
