import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRetro } from "../contexts/RetroContext";

interface Template {
  id: number;
  name: string;
}

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useRetro();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [retroName, setRetroName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setTemplates(
          data.data.map((template: any) => ({
            id: template.id,
            name: template.name,
          })),
        );
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

      dispatch({
        type: "SET_DATA",
        payload: {
          questions: data.data.questions.map((q: any) => ({
            id: q.id,
            content: q.content,
            postits: q.postits || [],
          })),
        },
      });
      console.log(data.data.id);

      navigate(`/retros/${data.data.id.toString()}`);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "An error occurred while creating the retro.");
    } finally {
      closeModal();
    }
  };

  return (
    <div className="template-list-page min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          🌟 Choisissez un Template 🌟
        </h1>
        <p className="text-lg text-gray-400 mb-12">
          Lancez une nouvelle rétrospective en sélectionnant un modèle existant.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <p className="text-center text-gray-500">
            Chargement des templates...
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <h2 className="text-xl font-semibold text-white mb-2">
                  {template.name}
                </h2>
                <button
                  className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-500 transition"
                  onClick={() => openModal(template.id)}
                >
                  Créer une rétro
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Aucun modèle disponible. Créez-en un pour commencer !
          </p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Nom de la Rétro</h2>
            <input
              type="text"
              className="w-full border border-gray-600 rounded-md p-2 mb-4 bg-gray-900 text-gray-300"
              placeholder="Entrez un nom pour la rétro"
              value={retroName}
              onChange={(e) => setRetroName(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-600 text-gray-200 py-2 px-4 rounded hover:bg-gray-500 transition"
                onClick={closeModal}
              >
                Annuler
              </button>
              <button
                className="bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-500 transition"
                onClick={() =>
                  selectedTemplateId && handleCreateRetro(selectedTemplateId)
                }
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateListPage;
