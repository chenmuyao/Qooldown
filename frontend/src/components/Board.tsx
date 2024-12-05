import React from "react";
import { useRetro } from "../contexts/RetroContext";
import PostIt from "./PostIt";

const Board: React.FC = () => {
  const { state, dispatch } = useRetro();

  const handleAddPostIt = (category: string) => {
    dispatch({
      type: "ADD_POSTIT",
      payload: { category },
    });
    // Ici, vous pourriez ajouter l'émission d'un événement socket
  };

  return (
    <div className="flex w-full h-screen bg-gray-100 border rounded-md">
      {state.categories.map((category, index) => (
        <div
          key={index}
          className="flex-1 p-4 border-r last:border-r-0 flex flex-col"
        >
          <div
            className="font-semibold text-gray-700 mb-4 cursor-pointer hover:bg-gray-200 p-2 rounded"
            onClick={() => handleAddPostIt(category)}
          >
            {category}
          </div>
          {state.postIts
            .filter((postIt) => postIt.category === category)
            .map((postIt) => (
              <PostIt
                key={postIt.id}
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
