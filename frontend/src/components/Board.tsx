import React from "react";
import { useRetro } from "../contexts/RetroContext";
import PostIt from "./PostIt";

const Board: React.FC = () => {
  const { state, dispatch } = useRetro();

  const handleAddPostIt = async (questionId: number, content: string) => {
    var id = 0;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/postits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_id: questionId,
          content: content,
          is_visible: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch templates.");
      }

      const data = await response.json();
      id = data.data.id;
    } catch (err: any) {
      console.error("Error:", err);
    }

    dispatch({
      type: "ADD_POSTIT",
      payload: { id, questionId, content },
    });
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-6 overflow-hidden">
      <div className="flex flex-wrap w-full h-full bg-white rounded shadow">
        {state.questions.map((question) => (
          <div
            key={question.id}
            className="flex-1 flex flex-col p-4 border-r border-gray-300 last:border-r-0"
          >
            {/* En-tête de la question */}
            <div
              className="font-semibold text-gray-700 mb-4 cursor-pointer hover:bg-gray-200 p-2 rounded bg-gray-50 sticky top-0 z-10"
              onClick={() => handleAddPostIt(question.id, "")}
            >
              {question.content}
            </div>

            {/* Conteneur scrollable pour les Post-its */}
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min overflow-y-auto"
              style={{
                maxHeight: "calc(100% - 50px)", // Ajuste en fonction de l'espace disponible
              }}
            >
              {question.postIts.map((postIt) => (
                <PostIt
                  key={postIt.id}
                  questionId={question.id}
                  id={postIt.id}
                  content={postIt.content}
                  hidden={postIt.hidden}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
