import React, { createContext, useContext, useReducer } from "react";

interface PostIt {
  id: string;
  content: string;
  category: string;
  hidden: boolean;
}

interface RetroState {
  postIts: PostIt[];
  categories: string[];
}

type Action =
  | { type: "ADD_POSTIT"; payload: { category: string } }
  | { type: "UPDATE_POSTIT_CONTENT"; payload: { id: string; content: string } }
  | { type: "TOGGLE_POSTIT_VISIBILITY"; payload: { id: string } }
  | { type: "DELETE_POSTIT"; payload: { id: string } }
  | { type: "SET_DATA"; payload: RetroState };

const initialState: RetroState = {
  postIts: [],
  categories: ["Start", "Stop", "Continue"],
};

const RetroContext = createContext<{
  state: RetroState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const RetroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer((state: RetroState, action: Action) => {
    switch (action.type) {
      case "ADD_POSTIT":
        const newPostItId = `postit-${Date.now()}`;
        return {
          ...state,
          postIts: [
            ...state.postIts,
            {
              id: newPostItId,
              content: "",
              category: action.payload.category,
              hidden: true,
            },
          ],
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

      case "TOGGLE_POSTIT_VISIBILITY":
        return {
          ...state,
          postIts: state.postIts.map((postIt) =>
            postIt.id === action.payload.id
              ? { ...postIt, hidden: !postIt.hidden }
              : postIt,
          ),
        };

      case "DELETE_POSTIT":
        return {
          ...state,
          postIts: state.postIts.filter(
            (postIt) => postIt.id !== action.payload.id,
          ),
        };

      case "SET_DATA":
        return action.payload;

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
