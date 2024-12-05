import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import Board from "../components/Board";
import { useRetro } from "../contexts/RetroContext";

const Retro: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const socket = useSocket(); // Utilisation du contexte global pour les WebSocket
  const { dispatch } = useRetro(); // Gestion du contexte de la rétro

  useEffect(() => {
    if (!id) return;

    // Fetch des données initiales de la rétro
    fetch(`/api/retros/${id}`)
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: "SET_DATA", payload: data }); // Mettre à jour le contexte
      });

    // Gestion des événements WebSocket pour synchroniser les données
    if (socket) {
      // Rejoindre la rétro
      socket.send(
        JSON.stringify({
          action: "join_retro",
          retro_id: id,
        }),
      );

      // Écoute des mises à jour de la rétro
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "retro_update":
            if (message.retroId === id) {
              dispatch({ type: "SET_DATA", payload: message }); // Mettre à jour le contexte à partir des messages reçus
            }
            break;
          case "retro_delete":
            if (message.retroId === id) {
              console.log("Rétrospective supprimée", id);
              // Ajouter une logique pour rediriger ou afficher un message
            }
            break;
          default:
            console.log("Message non pris en charge", message);
        }
      };

      // Cleanup lors de la sortie de la page
      return () => {
        // Quitter la rétro
        socket.send(
          JSON.stringify({
            action: "leave_retro",
            retro_id: id,
          }),
        );

        // Nettoyer l'écouteur de messages
        socket.onmessage = null;
      };
    }
  }, [id, socket, dispatch]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rétrospective #{id}</h2>
      <Board />
    </div>
  );
};

export default Retro;
