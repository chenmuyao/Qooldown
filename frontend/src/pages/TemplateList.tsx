import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";

interface Templates {
  id: number;
  name: string;
}

const TemplateListPage: React.FC = () => {
  const socket = useSocket(); // Utilisation du contexte WebSocket
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Templates[]>([]);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [newTemplateId, setNewTemplateId] = useState<number | null>(null);
  const [templateCreated, setTemplateCreated] = useState(false);
  const [retroName, setRetroName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Fetch initial retro list
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/templates", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          const templatesList = data.data.map((template: any) => ({
            id: template.id,
            name: template.name,
          }));
          setTemplates(templatesList);
        }
      } catch (error) {
        console.error("Error fetching retros:", error);
      }
    };

    fetchTemplates();

    // Gestion des messages WebSocket pour la mise à jour de la liste des rétros et la création d'une nouvelle rétro
    if (socket) {
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "template_list":
            setTemplates(message.templates);
            break;
          case "template_created":
            setTemplates((prevTemplates) => [
              ...prevTemplates,
              { id: message.template_id, name: message.template_name },
            ]);
            if (creatingTemplate) {
              setTemplateCreated(true);
              setNewTemplateId(message.template_id); // Sauvegarder l'ID de la nouvelle rétro
            }
            break;
          default:
            console.log("Message non pris en charge", message);
        }
      };

      // Cleanup de l'écouteur d'événements lors du démontage du composant
      return () => {
        socket.onmessage = null;
      };
    }
  }, [socket, creatingTemplate]);

  useEffect(() => {
    if (templateCreated && newTemplateId !== null) {
      navigate(`/template/${newTemplateId}/lobby`);
      setTemplateCreated(false);
    }
  }, [templateCreated, newTemplateId, navigate]);

  const openModal = (templateId: number) => {
    console.log(templateId);
    setSelectedTemplateId(templateId);
    setModalOpen(true);
  };

  const handleCreateRetro = async (templateId: number) => {
    try {
      const token = localStorage.getItem("token");
      console.log(templateId);
      const response = await fetch("/retros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: retroName, template_id: templateId }),
      });

      if (response.ok) {
        // Rediriger après la création réussie
        const data = await response.json();
        navigate(`/template/${data.id}`); // Remplacer avec l'ID du template créé
      } else {
        alert("Erreur lors de la création du template.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création du template.");
    }
    if (socket) {
      socket.send(
        JSON.stringify({
          action: "join_template",
          token: localStorage.getItem("token"),
          template_id: templateId,
        }),
      );
    }
    navigate(`/retro/${templateId}`);
  };

  return (
    <div className="template-list-page min-h-screen bg-yellow-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl text-orange-600 font-bold mb-6">
        🎉 Select a Template 🎉
      </h1>
      <div className="w-full max-w-2xl space-y-4">
        <div className="template-list space-y-2">
          {templates.length > 0 ? (
            templates.map((template) => (
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
            ))
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500 items-center">
                No templates available. Create one to start!
              </p>
            </div>
          )}
        </div>
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
                onClick={() => setModalOpen(false)}
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
