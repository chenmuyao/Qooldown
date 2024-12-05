import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";

interface Retro {
  id: number;
}

const RetroListPage: React.FC = () => {
  const socket = useSocket(); // Utilisation du contexte WebSocket
  const navigate = useNavigate();
  const [retros, setRetros] = useState<Retro[]>([]);
  const [creatingRetro, setCreatingRetro] = useState(false);
  const [newRetroId, setNewRetroId] = useState<number | null>(null);
  const [retroCreated, setRetroCreated] = useState(false);

  useEffect(() => {
    // Fetch initial retro list
    const fetchRetros = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/retros", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRetros(data.retros);
        }
      } catch (error) {
        console.error("Error fetching retros:", error);
      }
    };

    fetchRetros();

    // Gestion des messages WebSocket pour la mise à jour de la liste des rétros et la création d'une nouvelle rétro
    if (socket) {
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "retros_list":
            setRetros(message.retros);
            break;
          case "retro_created":
            setRetros((prevRetros) => [
              ...prevRetros,
              { id: message.retro_id },
            ]);
            if (creatingRetro) {
              setRetroCreated(true);
              setNewRetroId(message.retro_id); // Sauvegarder l'ID de la nouvelle rétro
            }
            break;
          default:
            console.log("Message non pris en charge", message);
        }
      };

      // Cleanup de l'écouteur d'événements lors du démontage du composant
      return () => {
        socket.onmessage = null;
      };
    }
  }, [socket, creatingRetro]);

  useEffect(() => {
    if (retroCreated && newRetroId !== null) {
      navigate(`/retro/${newRetroId}/lobby`);
      setRetroCreated(false);
    }
  }, [retroCreated, newRetroId, navigate]);

  const handleJoinRetro = (retroId: number) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          action: "join_retro",
          token: localStorage.getItem("token"),
          retro_id: retroId,
        }),
      );
    }
    navigate(`/retro/${retroId}`);
  };

  return (
    <div className="retro-list-page min-h-screen bg-yellow-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl text-orange-600 font-bold mb-6">
        🎉 Select a Retro 🎉
      </h1>
      <div className="w-full max-w-2xl space-y-4">
        <div className="retro-list space-y-2">
          {retros.length > 0 ? (
            retros.map((retro) => (
              <div
                key={retro.id}
                className="retro-item p-4 bg-white rounded-lg shadow-md flex justify-between items-center hover:bg-yellow-100 transition"
              >
                <div>
                  <h2 className="text-lg font-semibold text-orange-700">
                    {retro.id}
                  </h2>
                </div>
                <button
                  className="join-retro-button bg-green-500 text-white py-1 px-4 rounded-full hover:bg-green-600 transition"
                  onClick={() => handleJoinRetro(retro.id)}
                >
                  Join
                </button>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500 items-center">
                No retro available. Create one to start!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetroListPage;
