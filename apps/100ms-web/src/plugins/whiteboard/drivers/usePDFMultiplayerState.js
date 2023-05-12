import { useCallback, useEffect, useRef, useState } from "react";
import { provider as room } from "../PusherCommunicationProvider";
import { WhiteboardEvents as Events } from "../WhiteboardEvents";
import { useWhiteboardState } from "../useMultiplayerState";

export class PDFPageDetails {
  constructor() {
    this.liveShapes = new Map();
    this.liveBindings = new Map();
  }
}
export class PDFData {
  pdfPageDetails = new Map();
  constructor(url, currentPage = 1) {
    this.url = url;
    this.currentPage = currentPage;
    this.currentPageDetail = new PDFPageDetails();
    if (!this.pdfPageDetails.has(currentPage)) {
      this.pdfPageDetails.set(currentPage, this.currentPageDetail);
    }
  }
  setCurrentPageDetail(currentPage) {
    this.currentPage = currentPage;
    if (!this.pdfPageDetails.has(currentPage)) {
      this.currentPageDetail = new PDFPageDetails();
      this.pdfPageDetails.set(currentPage, this.currentPageDetail);
    } else {
      this.currentPageDetail = this.pdfPageDetails.get(currentPage);
    }
  }
  getCurrentPageDetail() {
    return this.currentPageDetail;
  }
  setCurrentPage(currentPage) {
    this.currentPage = currentPage;
    this.setCurrentPageDetail(currentPage);
  }
  setLiveShapes(liveShapes) {
    this.currentPageDetail.liveShapes = liveShapes;
  }
  setLiveBindings(liveBindings) {
    this.currentPageDetail.liveBindings = liveBindings;
  }
  get liveBindings() {
    return this.currentPageDetail.liveBindings;
  }
  get liveShapes() {
    return this.currentPageDetail.liveShapes;
  }
}
export function usePDFMultiplayerState(roomId) {
  // TldrawApp
  const [app, setApp] = useState(null);
  const [currPage, setCurrPage] = useState(1);
  const [file, setFile] = useState(null);
  // is pdf loaded and tldraw ready
  const [isReady, setIsReady] = useState(false);
  const { amIWhiteboardOwner, shouldRequestState } = useWhiteboardState();

  const initializePDF = useCallback((url, currentPage = 1) => {
    const pdfData = new PDFData(url, currentPage);
    pdfDataRef.current = pdfData;
  }, []);
  useEffect(() => {
    if (amIWhiteboardOwner) {
      setFile("https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK");
      initializePDF(file, 1);
    }
  }, [amIWhiteboardOwner, file, initializePDF]);
  const pdfDataRef = useRef(null);

  const getCurrentState = useCallback(() => {
    return {
      shapes: pdfDataRef.current?.liveShapes
        ? Object.fromEntries(pdfDataRef.current?.liveShapes)
        : {},
      bindings: pdfDataRef.current?.liveBindings
        ? Object.fromEntries(pdfDataRef.current?.liveBindings)
        : {},
      url: pdfDataRef.current?.url,
      currentPage: pdfDataRef.current?.currentPage,
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
  const updateLocalState = useCallback(
    ({ shapes, bindings, currentPage, merge = true }) => {
      if (currentPage) pdfDataRef.current?.setCurrentPage(currentPage);
      if (!(shapes && bindings)) return;

      if (merge) {
        const lShapes = pdfDataRef.current?.liveShapes;
        const lBindings = pdfDataRef.current?.liveBindings;

        if (!(lShapes && lBindings)) return;
        if (shapes) {
          Object.entries(shapes).forEach(([id, shape]) => {
            if (!shape) {
              lShapes.delete(id);
            } else {
              lShapes.set(shape.id, shape);
            }
          });
        }
        if (bindings) {
          Object.entries(bindings).forEach(([id, binding]) => {
            if (!binding) {
              lBindings.delete(id);
            } else {
              lBindings.set(binding.id, binding);
            }
          });
        }
      } else {
        pdfDataRef.current?.setLiveShapes(new Map(Object.entries(shapes)));
        pdfDataRef.current?.setLiveBindings(new Map(Object.entries(bindings)));
      }
    },
    []
  );
  // todo add page change
  const handleChanges = useCallback(
    state => {
      if (!state) {
        return;
      }
      const { shapes, bindings, url, currentPage, eventName } = state;

      if (!file) {
        setFile(url);
        initializePDF(file, currentPage);
      }
      setCurrPage(currentPage);
      updateLocalState({
        shapes,
        bindings,
        currentPage,
        merge: eventName === Events.STATE_CHANGE,
      });
      applyStateToBoard(getCurrentState());
    },
    [applyStateToBoard, file, getCurrentState, initializePDF, updateLocalState]
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
      // app.onZoom((info, e) => {
      //   console.log("info , e ", info, e);
      // });
      // app.store.subscribe(e => {
      //   console.log(app.store.getState());
      // });
      setApp(app);
    },
    [roomId]
  );

  const onChangePage = useCallback(
    (_app, shapes, bindings) => {
      if (!(shapes && bindings)) return;
      updateLocalState({ shapes, bindings });
      if (amIWhiteboardOwner) {
        room.broadcastEvent(Events.STATE_CHANGE, {
          shapes,
          bindings,
          url: pdfDataRef.current?.url,
          currentPage: pdfDataRef.current?.currentPage || 1,
        });
      }
      applyStateToBoard(getCurrentState());
    },
    [updateLocalState, amIWhiteboardOwner, applyStateToBoard, getCurrentState]
  );
  const onPDFPageChange = useCallback(
    currentPage => {
      setCurrPage(currentPage);
      pdfDataRef.current?.setCurrentPage(currentPage);
      if (amIWhiteboardOwner) {
        room.broadcastEvent(Events.STATE_CHANGE, {
          shapes: Object.fromEntries(pdfDataRef.current?.liveShapes),
          bindings: Object.fromEntries(pdfDataRef.current?.liveBindings),
          url: pdfDataRef.current?.url,
          currentPage: pdfDataRef.current?.currentPage || 1,
        });
      }
      applyStateToBoard(getCurrentState());
    },
    [amIWhiteboardOwner, applyStateToBoard, getCurrentState]
  );
  // const onChange = useCallback(app => {
  //   console.log("app ", app);
  // }, []);

  const onScaleChange = useCallback(
    scale => {
      console.log("scale ", scale, app);
      if (!app) return;
      app.zoomTo(scale);
      // app.store.setState(prevState => {
      //   return {
      //     ...prevState,
      //     appState: {
      //       ...prevState.appState,
      //       currentStyle: {
      //         ...prevState.appState.currentStyle,
      //         scale: scale,
      //       },
      //     },
      //   };
      // });
    },
    [app]
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
    // onChange,
    onPDFPageChange,
    onScaleChange,
    currPage,
    file,
  };
}
