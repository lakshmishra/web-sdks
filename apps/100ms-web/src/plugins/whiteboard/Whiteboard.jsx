import React, { useEffect, useRef } from "react";
import { Tldraw } from "@tldraw/tldraw";
import PDFViewer from "./drivers/PDFViewer";
import { useMultiplayerState } from "./useMultiplayerState";
import "./Whiteboard.css";

export const Whiteboard = React.memo(({ roomId }) => {
  const events = useMultiplayerState(roomId);
  const isPdf = false;
  console.log(roomId);
  return !isPdf ? (
    <Tldraw
      autofocus
      disableAssets={false}
      showSponsorLink={false}
      showPages={false}
      showMenu={false}
      {...events}
    />
  ) : (
    <PDFViewer isPdf={isPdf} roomId />
  );
});
