import React, { useState } from "react";
import { useRetro } from "../contexts/RetroContext";
import { Trash2 } from "lucide-react";

interface PostItProps {
  questionId: number;
  id: string;
  content: string;
  hidden: boolean;
}

const PostIt: React.FC<PostItProps> = ({ questionId, id, content, hidden }) => {
  const { dispatch } = useRetro();
  const [isEditing, setIsEditing] = useState(content === "");
  const [editedContent, setEditedContent] = useState(content);

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
          is_visible: true,
        }),
      });
    } catch (err) {
      console.error("Erreur:", err);
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
      console.error("Erreur:", err);
    }
  };

  return (
    <div
      className="relative bg-yellow-200 text-black font-sans shadow-lg rounded-lg p-4 hover:shadow-xl transition-all"
      style={{
        width: "200px",
        minHeight: "150px",
        maxHeight: "300px",
        overflowY: "auto",
        borderLeft: "8px solid #FCD34D", // Aspect "déchirure"
        transform: "rotate(-2deg)", // Légère inclinaison pour un effet réaliste
      }}
    >
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
          {hidden ? (
            <span className="italic text-gray-500">Caché</span>
          ) : (
            <p>{content}</p>
          )}
        </div>
      )}

      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={() =>
            dispatch({
              type: "TOGGLE_POSTIT_VISIBILITY",
              payload: { questionId, postItId: id },
            })
          }
          className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition"
        >
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
  );
};

export default PostIt;
