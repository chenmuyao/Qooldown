import React, { createContext, useContext, useReducer } from "react";

interface RetroState {
  postIts: PostIt[];
  categories: string[];
  template?: Template;
}

interface PostIt {
  id: string;
  content: string;
  posX: number;
  posY: number;
  lenX: number;
  lenY: number;
  hidden: boolean;
}

interface Template {
  id: string;
  name: string;
  categories: string[];
}

type Action =
  | { type: "SET_DATA"; payload: RetroState }
  | { type: "UPDATE_POSTIT"; payload: PostIt }
  | {
      type: "MOVE_POSTIT";
      payload: { sourceIndex: number; destinationIndex: number };
    }
  | { type: "UPDATE_POSTIT_CONTENT"; payload: { id: string; content: string } }
  | { type: "UNHIDE_POSTIT"; payload: { id: string } };

const initialState = {
  postIts: [
    {
      id: "1",
      content: "Améliorer le process",
      posX: 300,
      posY: 100,
      lenX: 150,
      lenY: 100,
      hidden: false,
    },
    {
      id: "2",
      content: "Communication interne",
      posX: 500,
      posY: 200,
      lenX: 150,
      lenY: 100,
      hidden: true,
    },
  ],
  categories: ["Start", "Stop", "Continue"],
  template: {
    id: "template1",
    name: "Sprint Retro",
    categories: ["Start", "Stop", "Continue"],
  },
};

const RetroContext = createContext<{
  state: RetroState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const RetroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer((state: RetroState, action: Action) => {
    switch (action.type) {
      case "SET_DATA":
        return { ...state, ...action.payload };

      case "UPDATE_POSTIT":
        return {
          ...state,
          postIts: state.postIts.map((p) =>
            p.id === action.payload.id ? action.payload : p,
          ),
        };

      case "UPDATE_POSTIT_CONTENT":
        return {
          ...state,
          postIts: state.postIts.map((postIt) =>
            postIt.id === action.payload.id
              ? { ...postIt, content: action.payload.content }
              : postIt,
          ),
        };

      case "UNHIDE_POSTIT":
        return {
          ...state,
          postIts: state.postIts.map((postIt) =>
            postIt.id === action.payload.id
              ? { ...postIt, hidden: false }
              : postIt,
          ),
        };

      case "MOVE_POSTIT":
        const reorderedPostIts = Array.from(state.postIts);
        const [movedPostIt] = reorderedPostIts.splice(
          action.payload.sourceIndex,
          1,
        );
        reorderedPostIts.splice(
          action.payload.destinationIndex,
          0,
          movedPostIt,
        );

        // Calculer les nouvelles positions uniquement si nécessaire
        const updatedPostIts = reorderedPostIts.map((postIt, index) => ({
          ...postIt,
          posX: index * 150, // Exemple de recalcul des positions
          posY: 50, // Alignement sur une même ligne
        }));

        return {
          ...state,
          postIts: updatedPostIts,
        };
      default:
        return state;
    }
  }, initialState);

  return (
    <RetroContext.Provider value={{ state, dispatch }}>
      {children}
    </RetroContext.Provider>
  );
};

export const useRetro = () => useContext(RetroContext);
