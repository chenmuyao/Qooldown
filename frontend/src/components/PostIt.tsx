import React, { useState } from "react";
import { useRetro } from "../contexts/RetroContext";

interface PostItProps {
  id: string;
  content: string;
  hidden: boolean;
}

const PostIt: React.FC<PostItProps> = ({ id, content, hidden }) => {
  const { dispatch } = useRetro();
  const [isEditing, setIsEditing] = useState(content === "");
  const [editedContent, setEditedContent] = useState(content);

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
    // Ici, vous pourriez ajouter l'émission d'un événement socket
  };

  const handleToggleVisibility = () => {
    dispatch({
      type: "TOGGLE_POSTIT_VISIBILITY",
      payload: { id },
    });
    // Ici, vous pourriez ajouter l'émission d'un événement socket
  };

  return (
    <div className="bg-yellow-200 border border-yellow-400 rounded shadow p-2 m-2 relative">
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={handleEditChange}
          onBlur={handleEditSave}
          className="w-full h-full border border-gray-300 rounded p-1"
          autoFocus
          placeholder="Écrivez votre note..."
        />
      ) : (
        <>
          {hidden ? (
            <div className="text-gray-500 italic">Caché</div>
          ) : (
            <div onDoubleClick={handleDoubleClick}>{content}</div>
          )}

          <button
            onClick={handleToggleVisibility}
            className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            {hidden ? "Dévoiler" : "Cacher"}
          </button>
        </>
      )}
    </div>
  );
};

export default PostIt;
