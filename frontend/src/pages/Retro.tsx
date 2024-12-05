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
    // Fetch des données initiales depuis l'API
    fetch(`/retros/${id}`, {
      method: "GET", // Méthode de la requête (GET ici)
      headers: {
        "Content-Type": "application/json", // Indiquer que la requête attend du JSON
        Authorization: `Bearer ${token}`, // Ajouter le token dans l'en-tête
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // On s'assure que data a la bonne structure avant de le passer au dispatch
        const payload = {
          questions: data.data.questions || [], // Assurez-vous que la réponse contient bien des questions
        };
        console.log(payload);

        // Dispatch des données dans le contexte
        dispatch({ type: "SET_DATA", payload });
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données :", error);
      });
  }, [id, dispatch]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rétrospective #{id}</h2>
      <Board />
    </div>
  );
};

export default Retro;
