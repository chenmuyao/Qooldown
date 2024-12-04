import { useEffect } from "react";
import { useRetro } from "../contexts/RetroContext";

export const useWebSocket = (retroId: string) => {
  const { dispatch } = useRetro();

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:4000/retros/${retroId}/ws`);

    socket.onmessage = (event) => {
      if (event.data === "update") {
        fetch(`/api/retros/${retroId}`)
          .then((res) => res.json())
          .then((data) => dispatch({ type: "SET_DATA", payload: data }));
      }
    };

    return () => socket.close();
  }, [retroId, dispatch]);
};
