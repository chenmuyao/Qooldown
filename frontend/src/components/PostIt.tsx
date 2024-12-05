import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useRetro } from "../contexts/RetroContext";

interface PostItProps {
  id: string;
  content: string;
  posX: number;
  posY: number;
  lenX: number;
  lenY: number;
  hidden: boolean;
  index: number;
}

const PostIt: React.FC<PostItProps> = ({
  id,
  content,
  hidden,
  index,
  posX,
  posY,
}) => {
  const { dispatch } = useRetro();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // Gère l'édition du contenu
  const handleDoubleClick = () => setIsEditing(true);

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    dispatch({
      type: "UPDATE_POSTIT_CONTENT",
      payload: { id, content: editedContent },
    });
  };

  // Gère le dévoilement du contenu caché
  const handleUnhide = () => {
    dispatch({
      type: "UNHIDE_POSTIT",
      payload: { id },
    });
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="absolute bg-yellow-200 border border-yellow-400 rounded shadow p-2 cursor-move"
          style={{
            ...provided.draggableProps.style, // Positionnement par react-beautiful-dnd
            //width: "150px",
            //minHeight: "100px",
            // left: provided.draggableProps.style ? undefined : `${posX}px`,
            //top: provided.draggableProps.style ? undefined : `${posY}px`,
          }}
        >
          {/* Contenu */}
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={handleEditChange}
              onBlur={handleEditSave}
              className="w-full h-full border border-gray-300 rounded p-1"
              autoFocus
            />
          ) : (
            <>
              {hidden ? (
                <div className="text-gray-500 italic">Caché</div>
              ) : (
                <div onDoubleClick={handleDoubleClick}>{content}</div>
              )}
              {hidden && (
                <button
                  onClick={handleUnhide}
                  className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded"
                >
                  Dévoiler
                </button>
              )}
            </>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default PostIt;
