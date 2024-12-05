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
    <div className="create-template-page p-6">
      <h2 className="text-2xl font-bold mb-4">
        Créer un template de rétrospective
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-semibold">Nom du template</label>
          <input
            type="text"
            value={templateName}
            onChange={handleTemplateNameChange}
            className="w-full px-4 py-2 border rounded"
            placeholder="Nom du template"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-semibold">Questions</label>
          {questions.map((question, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                className="w-full px-4 py-2 border rounded"
                placeholder={`Question ${index + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveQuestion(index)}
                className="text-red-500"
              >
                Supprimer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="bg-green-500 text-white py-2 px-4 rounded mt-2"
          >
            Ajouter une question
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          Créer le template
        </button>
      </form>
    </div>
  );
};

export default CreateTemplate;
