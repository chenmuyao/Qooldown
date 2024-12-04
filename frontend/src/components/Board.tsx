import React from "react";
import { useRetro } from "../contexts/RetroContext";
import PostIt from "./PostIt";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

const Board: React.FC = () => {
  const { state, dispatch } = useRetro();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.index === destination.index) return;

    dispatch({
      type: "MOVE_POSTIT",
      payload: {
        sourceIndex: source.index,
        destinationIndex: destination.index,
      },
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="board">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="relative w-full h-screen bg-gray-100 border rounded-md"
          >
            <div className="flex justify-around p-4 bg-gray-200 border-b">
              {state.categories.map((category, index) => (
                <div key={index} className="font-semibold text-gray-700">
                  {category}
                </div>
              ))}
            </div>
            {state.postIts.map((postIt, index) => (
              <PostIt key={postIt.id} index={index} {...postIt} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;
