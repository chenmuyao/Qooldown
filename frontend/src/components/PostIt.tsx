import React, { useState } from "react";
import { useRetro } from "../contexts/RetroContext";
import { Trash2 } from "lucide-react";

interface PostItProps {
  questionId: number; // Ajout de l'id de la question
  id: string;
  content: string;
  hidden: boolean;
}

const PostIt: React.FC<PostItProps> = ({ questionId, id, content, hidden }) => {
  const { dispatch } = useRetro();
  const [isEditing, setIsEditing] = useState(content === "");
  const [editedContent, setEditedContent] = useState(content);

  const handleDoubleClick = () => setIsEditing(true);

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const handleEditSave = async () => {
    setIsEditing(false);
    console.log("test");
    dispatch({
      type: "UPDATE_POSTIT_CONTENT",
      payload: { questionId, postItId: id, content: editedContent }, // Ajout de questionId dans l'action
    });
    const token = localStorage.getItem("token");
    try {
      console.log(id);
      const response = await fetch(`/postits/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: id,
          question_id: questionId,
          content: editedContent,
          is_visible: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update postit.");
      }

      const data = await response.json();
      console.log(data);
    } catch (err: any) {
      console.error("Error:", err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce post-it ?",
    );
    if (confirmDelete) {
      dispatch({
        type: "DELETE_POSTIT",
        payload: { questionId, postItId: id }, // Ajout de questionId dans l'action
      });
      const token = localStorage.getItem("token");
      try {
        console.log(id);
        const response = await fetch(`/postits/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete postit.");
        }

        const data = await response.json();
        console.log(data);
      } catch (err: any) {
        console.error("Error:", err);
      }
    }
  };

  const handleToggleVisibility = () => {
    dispatch({
      type: "TOGGLE_POSTIT_VISIBILITY",
      payload: { questionId, postItId: id }, // Ajout de questionId dans l'action
    });
    // Ici, vous pourriez ajouter l'émission d'un événement socket
  };

  return (
    <div className="bg-yellow-200 border border-yellow-400 rounded shadow p-2 m-2 relative">
      <div
        className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
        title="Supprimer le post-it"
      >
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={16} />
        </button>
      </div>{" "}
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
