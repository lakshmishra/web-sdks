import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import * as TlDraw from "@tldraw/tldraw";
import { Box } from "@100mslive/react-ui";
import { usePDFMultiplayerState } from "./usePDFMultiplayerState";
import "./PDFViewer.css";

const PDF_SCALE = {
  1440: 1.5,
  720: 1,
  360: 0.7,
  0: 0.5,
};
function PDFViewer({ isPdf, roomId }) {
  const { onMount, onChangePage, initializePDF } =
    usePDFMultiplayerState(roomId);
  const [file, setFile] = useState(
    "https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK"
  );
  const [isRendered, setIsRendered] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const ref = useRef(null);
  const currentPageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const tldrawContext = useContext(TlDraw.TldrawApp);
  console.log("usecontext ", tldrawContext);
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      // Do something with the entries, for example log them
      console.log("handle ", entries[0].target.clientHeight);
      if (entries.length > 0) {
        for (const width in PDF_SCALE) {
          if (entries[0].target.clientWidth > width) {
            setScale(PDF_SCALE[width]);
          }
        }
      }
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  function onDocumentLoadSuccess({ numPages }) {
    console.log("loading", numPages);
    setNumPages(numPages);
    // renderPage();
  }
  function onRenderSuccess() {
    setIsRendered(true);
  }
  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  useEffect(() => {
    if (!isRendered || !currentPageRef.current) {
      return;
    }
    initializePDF(file, numPages, 1);
  }, [isRendered, initializePDF, file, numPages]);
  const onPageChange = (app, shapes, bindings) => {
    console.log(shapes, bindings);
    onChangePage(app, shapes, bindings);
  };
  return (
    <Box
      ref={ref}
      css={{
        ".tl-container": {
          backgroundColor: "transparent !important",
        },
        height: "inherit",
        width: "inherit",
        position: "relative",
      }}
    >
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="pdf_document"
      >
        <Page
          canvasRef={currentPageRef}
          key={`page_${numPages}`}
          pageNumber={numPages}
          onRenderSuccess={onRenderSuccess}
          scale={scale}
        />
      </Document>
      <TlDraw.Tldraw
        autofocus
        disableAssets={true}
        showSponsorLink={false}
        showPages={true}
        showMenu={false}
        onChangePage={onPageChange}
        showZoom={true}
        onMount={onMount}
      />
    </Box>
  );
}

export default PDFViewer;
