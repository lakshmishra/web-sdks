import { useCallback, useEffect, useRef, useState } from "react";
import { provider as room } from "../PusherCommunicationProvider";
import { WhiteboardEvents as Events } from "../WhiteboardEvents";
import { useWhiteboardState } from "../useMultiplayerState";

export class PDFData {
  constructor(url, totalPages, currentPage = 1) {
    this.url = url;
    this.totalPages = totalPages;
    this.currentPage = currentPage;
    this.liveShapes = new Map();
    this.liveBindings = new Map();
  }
  setLiveShapes(liveShapes) {
    this.liveShapes = liveShapes;
  }
  setCurrentPage(currentPage) {
    this.currentPage = currentPage;
  }
  setLiveBinding(liveBindings) {
    this.liveBindings = liveBindings;
  }
}
export function usePDFMultiplayerState(roomId) {
  // TldrawApp
  const [app, setApp] = useState(null);
  // is pdf loaded and tldraw ready
  const [isReady, setIsReady] = useState(false);
  const { amIWhiteboardOwner, shouldRequestState } = useWhiteboardState();

  const pdfDataRef = useRef(null);

  const getCurrentState = useCallback(() => {
    return {
      shapes: pdfDataRef.current?.liveShapes
        ? Object.fromEntries(pdfDataRef.current?.liveShapes.current)
        : {},
      bindings: pdfDataRef.current?.liveBindings
        ? Object.fromEntries(pdfDataRef.current?.liveBindings.current)
        : {},
      url: pdfDataRef.current?.url,
      currentPage: pdfDataRef.current?.currentPage,
      totalPages: pdfDataRef.current?.totalPages,
    };
  }, []);

  const sendCurrentState = useCallback(() => {
    if (amIWhiteboardOwner && isReady) {
      room.broadcastEvent(Events.CURRENT_STATE, getCurrentState());
    }
  }, [amIWhiteboardOwner, isReady, getCurrentState]);

  const applyStateToBoard = useCallback(
    state => {
      app === null || app === void 0
        ? void 0
        : app.replacePageContent(
            state.shapes,
            state.bindings,
            {} // Object.fromEntries(lAssets.entries())
          );
    },
    [app]
  );
  const updateLocalState = useCallback(({ shapes, bindings, merge = true }) => {
    if (!(shapes && bindings)) return;

    if (merge) {
      const lShapes = pdfDataRef.current?.liveBinding;
      const lBindings = pdfDataRef.current?.liveBindings;

      if (!(lShapes && lBindings)) return;
      Object.entries(shapes).forEach(([id, shape]) => {
        if (!shape) {
          lShapes.delete(id);
        } else {
          lShapes.set(shape.id, shape);
        }
      });

      Object.entries(bindings).forEach(([id, binding]) => {
        if (!binding) {
          lBindings.delete(id);
        } else {
          lBindings.set(binding.id, binding);
        }
      });
    } else {
      pdfDataRef.current.setLiveShapes(new Map(Object.entries(shapes)));
      pdfDataRef.current.setLiveBinding(new Map(Object.entries(bindings)));
    }
  }, []);
  // todo add page change
  const handleChanges = useCallback(
    state => {
      if (!state) {
        return;
      }

      const { shapes, bindings, eventName } = state;
      updateLocalState({
        shapes,
        bindings,
        merge: eventName === Events.STATE_CHANGE,
      });
      applyStateToBoard(getCurrentState());
    },
    [applyStateToBoard, getCurrentState, updateLocalState]
  );
  const setupInitialState = useCallback(() => {
    if (!isReady) {
      return;
    }

    if (amIWhiteboardOwner) {
      // On board open, update the document with initial/stored content
      handleChanges(room.getStoredEvent(Events.CURRENT_STATE));
      // Send current state to other peers in the room currently
      sendCurrentState();
    } else if (shouldRequestState) {
      /**
       * Newly joined peers request the owner for current state
       * and update their boards when they receive it
       */
      room.broadcastEvent(Events.REQUEST_STATE);
    }
  }, [
    isReady,
    amIWhiteboardOwner,
    shouldRequestState,
    handleChanges,
    sendCurrentState,
  ]);
  // provide a tldraw app view
  const onMount = useCallback(
    app => {
      app.loadRoom(roomId);
      app.pause(); // Turn off the app's own undo / redo stack
      setApp(app);
    },
    [roomId]
  );
  const initializePDF = useCallback((url, totalPages, currentPage = 1) => {
    const pdfData = new PDFData(url, totalPages, currentPage);
    pdfDataRef.current = pdfData;
  }, []);

  const onChangePage = useCallback(
    (_app, shapes, bindings) => {
      if (!(shapes && bindings)) return;
      updateLocalState({ shapes, bindings });
      console.log("here ", shapes, bindings);
      room.broadcastEvent(Events.STATE_CHANGE, {
        shapes,
        bindings,
        url: pdfDataRef.current?.url,
        currentPage: pdfDataRef.current?.currentPage || 1,
        totalPages: pdfDataRef.current?.totalPages,
      });
      applyStateToBoard(getCurrentState());
    },
    [updateLocalState, applyStateToBoard, getCurrentState]
  );

  useEffect(() => {
    if (!app) return;
    const unsubs = [];

    let stillAlive = true;

    // Setup the document's storage and subscriptions
    function setupDocument() {
      // Subscribe to changes
      if (stillAlive) {
        unsubs.push(room.subscribe(Events.STATE_CHANGE, handleChanges));
        unsubs.push(room.subscribe(Events.CURRENT_STATE, handleChanges));

        // On request state(peer join), send whole current state to update the new peer's whiteboard
        unsubs.push(room.subscribe(Events.REQUEST_STATE, sendCurrentState));

        setIsReady(true);
      }
    }

    room.init(roomId);
    setupDocument();
    setupInitialState();

    return () => {
      stillAlive = false;
      unsubs.forEach(unsub => unsub());
    };
  }, [app, roomId, setupInitialState, sendCurrentState, handleChanges]);

  return {
    onMount,
    onChangePage,
    initializePDF,
  };
}
