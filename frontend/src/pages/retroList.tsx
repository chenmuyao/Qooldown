import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Retro {
  id: number;
  name: string;
}

const RetroListPage: React.FC = () => {
  const navigate = useNavigate();
  const [retros, setRetros] = useState<Retro[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch retros on component mount
  useEffect(() => {
    const fetchRetros = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const response = await fetch("/retros", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch retros.");
        }

        const data = await response.json();
        const retrosList = data.data.map((retro: any) => ({
          id: retro.id,
          name: retro.name,
        }));
        setRetros(retrosList);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching retros.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetros();
  }, []);

  const handleJoinRetro = (retroId: number) => {
    navigate(`/retro/${retroId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-5xl font-bold text-white mb-10 animate-slide-up">
        🌟 Rejoignez une Rétrospective 🌟
      </h1>

      <div className="w-full max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center">
            <p className="text-gray-400 animate-pulse">
              Chargement des rétros...
            </p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : retros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retros.map((retro) => (
              <div
                key={retro.id}
                className="relative bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-xl shadow-lg transform transition hover:-translate-y-2 hover:shadow-2xl animate-slide-up"
              >
                <h2 className="text-xl font-semibold text-white mb-2">
                  {retro.name}
                </h2>
                <p className="text-gray-200 text-sm">ID: {retro.id}</p>

                <button
                  className="absolute bottom-4 right-4 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition"
                  onClick={() => handleJoinRetro(retro.id)}
                >
                  Rejoindre
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-400">Aucune rétrospective disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetroListPage;
