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
          is_visible: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch templates.");
      }

      const data = await response.json();
      console.log(data);
      id = data.data.id;
    } catch (err: any) {
      console.error("Error:", err);
    }
    console.log(id);
    dispatch({
      type: "ADD_POSTIT",
      payload: { id, questionId, content },
    });
  };

  return (
    <div className="flex w-full h-screen bg-gray-100 border rounded-md">
      {state.questions.map((question) => (
        <div
          key={question.id}
          className="flex-1 p-4 border-r last:border-r-0 flex flex-col"
        >
          <div
            className="font-semibold text-gray-700 mb-4 cursor-pointer hover:bg-gray-200 p-2 rounded"
            onClick={() => handleAddPostIt(question.id, "")}
          >
            {question.content}
          </div>
          {question.postIts.map((postIt) => (
            <PostIt
              key={postIt.id}
              questionId={question.id} // Passer questionId ici
              id={postIt.id}
              content={postIt.content}
              hidden={postIt.hidden}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
