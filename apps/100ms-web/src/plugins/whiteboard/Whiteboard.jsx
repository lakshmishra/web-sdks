import React, { useEffect, useRef } from "react";
import { Tldraw } from "@tldraw/tldraw";
import PDFViewer from "./drivers/PDFViewer";
import { useMultiplayerState } from "./useMultiplayerState";
import "./Whiteboard.css";

export const Whiteboard = React.memo(({ roomId }) => {
  const events = useMultiplayerState(roomId);
  const isPdf = true;

  return !isPdf ? (
    <Tldraw
      autofocus
      disableAssets={true}
      showSponsorLink={false}
      showPages={false}
      showMenu={false}
      {...events}
    />
  ) : (
    <PDFViewer isPdf />
  );
});
