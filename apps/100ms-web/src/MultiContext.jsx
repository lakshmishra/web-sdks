import React, { useEffect, useRef } from "react";
import {
  CreateContextProvider,
  HMSRoomState,
  selectPeerCount,
  selectRoomState,
} from "@100mslive/react-sdk";
import { v4 } from "uuid";
import { defaultTokenEndpoint } from "./App";
import getToken from "./services/tokenService";

const ContextCreator = CreateContextProvider();
const rooms = ["60f26ab342a997a1ff49c5c2", "615d961caef0824550287376"];
const MultiContext = () => {
  return (
    <div>
      {rooms.map(room => {
        const { HMSRoomProvider, useHMSStore, useHMSActions } =
          ContextCreator(room);
        return (
          <HMSRoomProvider key={room}>
            <Preview
              room={room}
              useHMSStore={useHMSStore}
              useHMSActions={useHMSActions}
            />
          </HMSRoomProvider>
        );
      })}
    </div>
  );
};

export const Preview = ({ room, useHMSStore, useHMSActions }) => {
  const actions = useHMSActions();
  const roomState = useHMSStore(selectRoomState);
  const previewCalled = useRef(false);
  const peerCount = useHMSStore(selectPeerCount);

  useEffect(() => {
    (async () => {
      if (roomState === HMSRoomState.Disconnected && !previewCalled.current) {
        const token = await getToken(
          defaultTokenEndpoint,
          v4(),
          "student",
          room
        );
        await actions.preview({
          authToken: token,
          userName: "test",
          initEndpoint: "https://qa-init.100ms.live/init",
        });
        previewCalled.current = true;
      }
    })();
  }, [actions, roomState, room]);

  return (
    <div>
      Preview {room} - {peerCount}
    </div>
  );
};

export default MultiContext;
