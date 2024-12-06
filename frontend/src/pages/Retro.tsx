import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/Board";
import { useRetro } from "../contexts/RetroContext";

const Retro: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { dispatch } = useRetro();

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    fetch(`/retros/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch({
          type: "SET_DATA",
          payload: { questions: data.data.questions || [] },
        });
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des données :", error),
      );
  }, [id, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-700 via-blue-800 to-indigo-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Rétrospective #{id}
      </h2>
      <Board />
    </div>
  );
};

export default Retro;
