import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/Board";
import { useRetro } from "../contexts/RetroContext";
import ConfettiButton from "../components/Cofetti";

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
        // Transforme les données pour mapper owner_id à userId et inclure les votes
        const transformedQuestions = data.data.questions.map(
          (question: any) => ({
            ...question,
            postIts: question.postIts.map((postIt: any) => ({
              ...postIt,
              userId: postIt.owner_id, // Renomme owner_id en userId
              votes: postIt.votes || 0, // Ajout du nombre de votes, défaut à 0
            })),
          }),
        );

        dispatch({
          type: "SET_DATA",
          payload: { questions: transformedQuestions },
        });
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des données :", error),
      );
  }, [id, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-700 via-blue-800 to-indigo-900 text-white p-6">
      <div>
        <h2 className="text-3xl font-bold mb-6 text-center">
          Rétrospective #{id}
        </h2>
        <ConfettiButton />
      </div>
      <Board />
    </div>
  );
};

export default Retro;
