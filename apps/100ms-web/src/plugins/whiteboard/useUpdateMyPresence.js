// @ts-check

import { useCallback, useEffect, useState } from "react";
import { provider as room } from "./PusherCommunicationProvider";
import { WhiteboardEvents as Events } from "./WhiteboardEvents";

export const useUpdateMyPresence = () => {
  const [user, setUser] = useState(null);

  const updateMyPresence = useCallback(
    (_, /** @type {import("@tldraw/tldraw").TDUser} */ newUser) => {
      setUser(newUser);
    },
    []
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      room.broadcastEvent(Events.PRESENCE_CHANGE, { user });
    }, 200);

    return () => clearInterval(intervalId);
  }, [user]);

  return updateMyPresence;
};
