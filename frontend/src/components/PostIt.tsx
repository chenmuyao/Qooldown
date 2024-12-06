import React, { useState } from "react";
import { useRetro } from "../contexts/RetroContext";
import { Trash2, EyeOff, Eye } from "lucide-react";

interface PostItProps {
  questionId: number;
  id: string;
  content: string;
  hidden: boolean;
  userId: string;
}

const PostIt: React.FC<PostItProps> = ({
  questionId,
  id,
  content,
  hidden: initialHidden,
  userId,
}) => {
  const { dispatch } = useRetro();
  const [isEditing, setIsEditing] = useState(content === "");
  const [editedContent, setEditedContent] = useState(content);
  const [hidden, setHidden] = useState(initialHidden);

  const currentUserId = localStorage.getItem("userId");

  const handleSave = async () => {
    setIsEditing(false);
    dispatch({
      type: "UPDATE_POSTIT_CONTENT",
      payload: { questionId, postItId: id, content: editedContent },
    });

    const token = localStorage.getItem("token");
    try {
      await fetch(`/postits/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          question_id: questionId,
          content: editedContent,
          is_visible: !hidden,
        }),
      });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
    }
  };

  const handleToggleVisibility = async () => {
    const token = localStorage.getItem("token");
    const newHiddenState = !hidden;

    try {
      await fetch(`/postits/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          question_id: questionId,
          content: editedContent,
          is_visible: !newHiddenState,
        }),
      });

      setHidden(newHiddenState);

      dispatch({
        type: "UPDATE_POSTIT_CONTENT",
        payload: { questionId, postItId: id, content: editedContent },
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la visibilité :", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce post-it ?")) return;

    dispatch({ type: "DELETE_POSTIT", payload: { questionId, postItId: id } });

    const token = localStorage.getItem("token");
    try {
      await fetch(`/postits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  return (
    <div
      className="relative bg-yellow-200 text-black font-sans shadow-lg rounded-lg p-4 hover:shadow-xl transition-all flex flex-col"
      style={{
        width: "200px",
        minHeight: "150px",
        maxHeight: "300px",
        overflowY: "auto",
        borderLeft: "8px solid #FCD34D",
        transform: "rotate(-2deg)",
      }}
    >
      {/* Conteneur pour le contenu du post-it */}
      <div className="flex-grow relative">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onBlur={handleSave}
            className="w-full h-full bg-yellow-100 text-black border-none resize-none focus:outline-none p-2 rounded"
            autoFocus
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className="whitespace-pre-wrap break-words"
          >
            <p>{content}</p>
          </div>
        )}
      </div>

      {/* Barre de boutons en bas */}
      {String(currentUserId) === String(userId) && (
        <div className="flex justify-between items-center mt-2 border-t border-yellow-300 pt-2">
          <div className="flex space-x-2">
            <button
              onClick={handleToggleVisibility}
              className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition flex items-center"
            >
              {hidden ? (
                <Eye size={16} className="mr-1" />
              ) : (
                <EyeOff size={16} className="mr-1" />
              )}
              {hidden ? "Dévoiler" : "Cacher"}
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostIt;
