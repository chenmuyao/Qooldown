import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import Board from "../components/Board";
import { useRetro } from "../contexts/RetroContext";

const Retro: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const socket = useSocket();
  const { dispatch } = useRetro();

  useEffect(() => {
    if (!id) return;

    // Fetch des données initiales
    fetch(`/api/retros/${id}`)
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: "SET_DATA", payload: data });
      });

    if (socket) {
      // Rejoindre la rétro
      socket.send(
        JSON.stringify({
          action: "join_retro",
          retro_id: id,
        }),
      );

      // Gestion des événements WebSocket
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "retro_update":
            if (message.retroId === id) {
              dispatch({ type: "SET_DATA", payload: message.data });
            }
            break;
          case "retro_delete":
            if (message.retroId === id) {
              console.log("Rétrospective supprimée", id);
              // Logique de redirection ou affichage de message
            }
            break;
          default:
            console.log("Message non pris en charge", message);
        }
      };

      // Cleanup
      return () => {
        socket.send(
          JSON.stringify({
            action: "leave_retro",
            retro_id: id,
          }),
        );
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
