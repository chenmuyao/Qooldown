import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRetro } from "../contexts/RetroContext"; // Assurez-vous que ce chemin est correct

interface Template {
  id: number;
  name: string;
}

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useRetro(); // Utilisation du contexte pour gérer l'état global
  const [templates, setTemplates] = useState<Template[]>([]);
  const [retroName, setRetroName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial template list
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch("/templates", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch templates.");
        }

        const data = await response.json();
        const templatesList = data.data.map((template: any) => ({
          id: template.id,
          name: template.name,
        }));
        setTemplates(templatesList);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching templates.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const openModal = (templateId: number) => {
    setSelectedTemplateId(templateId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRetroName("");
    setSelectedTemplateId(null);
  };

  const handleCreateRetro = async (templateId: number) => {
    if (!retroName.trim()) {
      alert("Please enter a valid retro name.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/retros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: retroName, template_id: templateId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create the retro.");
      }

      const data = await response.json();

      // Injection des données dans RetroState
      dispatch({
        type: "SET_DATA",
        payload: {
          questions: data.data.questions.map((q: any) => ({
            id: q.id,
            content: q.content,
            postits: q.postits || [],
          })),
          //postIts: [], // Les post-its existants peuvent être initialisés ici si nécessaires
        },
      });

      // Redirection vers la page de la rétro
      navigate(`/retros/${data.id}`);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "An error occurred while creating the retro.");
    } finally {
      closeModal();
    }
  };

  return (
    <div className="template-list-page min-h-screen bg-yellow-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl text-orange-600 font-bold mb-6">
        🎉 Select a Template 🎉
      </h1>

      <div className="w-full max-w-2xl space-y-4">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading templates...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : templates.length > 0 ? (
          <div className="template-list space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="template-item p-4 bg-white rounded-lg shadow-md flex justify-between items-center hover:bg-yellow-100 transition"
              >
                <div>
                  <h2 className="text-lg font-semibold text-orange-700">
                    {template.name}
                  </h2>
                </div>
                <button
                  className="join-template-button bg-green-500 text-white py-1 px-4 rounded-full hover:bg-green-600 transition"
                  onClick={() => openModal(template.id)}
                >
                  Create Retro
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 items-center">
              No templates available. Create one to start!
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Enter Retro Name</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Retro Name"
              value={retroName}
              onChange={(e) => setRetroName(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 text-gray-700 py-1 px-4 rounded hover:bg-gray-400"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="join-template-button bg-green-500 text-white py-1 px-4 rounded-full hover:bg-green-600 transition"
                onClick={() =>
                  selectedTemplateId && handleCreateRetro(selectedTemplateId)
                }
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateListPage;
