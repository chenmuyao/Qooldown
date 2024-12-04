import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import Board from "../components/Board";

const Retro: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Utiliser le WebSocket pour synchroniser les données de cette rétro
  useWebSocket(id!);

  useEffect(() => {
    // Fetch initial data
    fetch(`/api/retros/${id}`)
      .then((res) => res.json())
      .then((data) => console.log("Fetched Retro Data:", data));
  }, [id]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rétrospective #{id}</h2>
      <Board />
    </div>
  );
};

export default Retro;
