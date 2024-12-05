import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTemplate: React.FC = () => {
  const navigate = useNavigate();

  // État pour le nom du template
  const [templateName, setTemplateName] = useState<string>("");
  // État pour les questions
  const [questions, setQuestions] = useState<string[]>([""]); // Initialiser avec une question vide

  const handleTemplateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateName(e.target.value);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, ""]); // Ajouter une nouvelle question vide
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions); // Supprimer une question
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier que le nom du template et les questions sont définis
    if (!templateName || questions.some((q) => q.trim() === "")) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const templateData = {
      name: templateName,
      questions: questions.filter((q) => q.trim() !== ""), // Supprimer les questions vides
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(templateData),
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
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Animations de fond complexes et dynamiques */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute animate-blob top-10 left-20 w-72 h-72 bg-purple-700/30 rounded-full filter blur-2xl animate-pulse"></div>
        <div className="absolute animate-blob animation-delay-2000 top-1/3 right-20 w-64 h-64 bg-blue-600/30 rounded-full filter blur-2xl animate-bounce"></div>
        <div className="absolute animate-blob animation-delay-4000 bottom-20 left-1/3 w-80 h-80 bg-red-600/30 rounded-full filter blur-2xl animate-spin"></div>

        {/* Couches supplémentaires d'animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-900/70 animate-gradient-x"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 animate-slide-up">
            Créer un template de rétrospective
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-gray-800/60 p-6 rounded-lg shadow-xl"
          >
            <div>
              <label className="block text-lg font-semibold">
                Nom du template
              </label>
              <input
                type="text"
                value={templateName}
                onChange={handleTemplateNameChange}
                className="w-full px-4 py-3 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Nom du template"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold">Questions</label>
              {questions.map((question, index) => (
                <div key={index} className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) =>
                      handleQuestionChange(index, e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Question ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddQuestion}
                className="bg-green-600 text-white py-2 px-6 rounded-lg mt-4 transition-colors hover:bg-green-500"
              >
                Ajouter une question
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 transition-colors hover:bg-blue-500"
            >
              Créer le template
            </button>
          </form>
        </div>
      </div>

      {/* Élément de décoration techno */}
      <div className="absolute bottom-10 right-10 z-0 opacity-30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-32 h-32 text-gray-500"
        >
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
        </svg>
      </div>
    </div>
  );
};

export default CreateTemplate;
