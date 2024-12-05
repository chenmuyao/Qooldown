import React, { createContext, useContext, useReducer } from "react";

// Structure d'un Post-it
interface PostIt {
  id: string;
  content: string;
  hidden: boolean;
}

// Structure d'une Question
interface Question {
  id: number;
  content: string;
  postIts: PostIt[];
}

// Structure de l'état global de la rétro
interface RetroState {
  questions: Question[];
}

// Actions possibles pour modifier l'état
type Action =
  | { type: "ADD_POSTIT"; payload: { questionId: number; content: string } }
  | {
      type: "UPDATE_POSTIT_CONTENT";
      payload: { questionId: number; postItId: string; content: string };
    }
  | {
      type: "TOGGLE_POSTIT_VISIBILITY";
      payload: { questionId: number; postItId: string };
    }
  | { type: "DELETE_POSTIT"; payload: { questionId: number; postItId: string } }
  | { type: "SET_DATA"; payload: RetroState };

// État initial
const initialState: RetroState = {
  questions: [], // Les questions (et leurs post-its) viennent du backend
};

// Création du contexte
const RetroContext = createContext<{
  state: RetroState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Reducer pour gérer les actions
const retroReducer = (state: RetroState, action: Action): RetroState => {
  switch (action.type) {
    case "ADD_POSTIT": {
      const { questionId, content } = action.payload;
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                postIts: [
                  ...question.postIts,
                  {
                    id: `postit-${Date.now()}`,
                    content,
                    hidden: false, // Visible par défaut
                  },
                ],
              }
            : question,
        ),
      };
    }

    case "UPDATE_POSTIT_CONTENT": {
      const { questionId, postItId, content } = action.payload;
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                postIts: question.postIts.map((postIt) =>
                  postIt.id === postItId ? { ...postIt, content } : postIt,
                ),
              }
            : question,
        ),
      };
    }

    case "TOGGLE_POSTIT_VISIBILITY": {
      const { questionId, postItId } = action.payload;
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                postIts: question.postIts.map((postIt) =>
                  postIt.id === postItId
                    ? { ...postIt, hidden: !postIt.hidden }
                    : postIt,
                ),
              }
            : question,
        ),
      };
    }

    case "DELETE_POSTIT": {
      const { questionId, postItId } = action.payload;
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                postIts: question.postIts.filter(
                  (postIt) => postIt.id !== postItId,
                ),
              }
            : question,
        ),
      };
    }

    case "SET_DATA":
      return action.payload;

    default:
      return state;
  }
};

// Provider pour le contexte
export const RetroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(retroReducer, initialState);

  return (
    <RetroContext.Provider value={{ state, dispatch }}>
      {children}
    </RetroContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useRetro = () => useContext(RetroContext);
