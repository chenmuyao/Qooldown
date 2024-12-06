import React, { createContext, useContext, useReducer } from "react";
import PostIt from "../components/PostIt";

// Structure d'un Post-it (ajout de votes)
interface PostIt {
  id: string;
  content: string;
  hidden: boolean;
  userId: string;
  votes?: number; // Add votes to the interface
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

// Actions possibles pour modifier l'état (ajout de VOTE_POSTIT)
type Action =
  | {
      type: "ADD_POSTIT";
      payload: {
        id: number;
        questionId: number;
        content: string;
        userId: string;
        votes?: number;
      };
    }
  | {
      type: "UPDATE_POSTIT_CONTENT";
      payload: { questionId: number; postItId: string; content: string };
    }
  | {
      type: "UPDATE_POSTIT_VOTES";
      payload: { questionId: number; postItId: string; votes: number };
    }
  | {
      type: "TOGGLE_POSTIT_VISIBILITY";
      payload: { questionId: number; postItId: string };
    }
  | { 
      type: "VOTE_POSTIT"; 
      payload: { 
        questionId: number; 
        postItId: string; 
        currentVotes: number 
      }; 
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
      const { id, questionId, content, userId, votes = 0 } = action.payload;
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                postIts: [
                  ...question.postIts,
                  {
                    id: id.toString(),
                    content,
                    hidden: false, // Visible par défaut
                    userId,

                    votes, // Add votes to the new post-it

                  },
                ],
              }
            : question,
        ),
      };
    }

    // Autres cas précédents restent identiques...


    case "UPDATE_POSTIT_VOTES": {
      const { questionId, postItId, votes } = action.payload;
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                postIts: question.postIts.map((postIt) =>
                  postIt.id === postItId ? { ...postIt, votes } : postIt,
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
                    ? { ...postIt, votes: currentVotes + 1 }
                    : postIt,
                ),
              }
            : question,
        ),
      };
    }

    case "SET_DATA":
      console.log("Données transformées :", action.payload);
      return action.payload;

    default:
      return state;
  }
};

// Provider et autres parties restent identiques...

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

export const useRetro = () => useContext(RetroContext);
