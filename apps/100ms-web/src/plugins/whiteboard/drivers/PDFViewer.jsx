import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import * as TlDraw from "@tldraw/tldraw";
import { Box, Button, Flex } from "@100mslive/react-ui";
import { useWhiteboardMetadata } from "../useWhiteboardMetadata";
import { usePDFMultiplayerState } from "./usePDFMultiplayerState";
import "./PDFViewer.css";

const PDF_SCALE = {
  1440: 1.5,
  720: 1,
  360: 0.7,
  0: 0.5,
};
function PDFViewer({ isPdf, roomId }) {
  const {
    onMount,
    onChangePage,
    onScaleChange,
    onPDFPageChange,
    currPage,
    file,
  } = usePDFMultiplayerState(roomId);
  const { amIWhiteboardOwner } = useWhiteboardMetadata();
  const [isRendered, setIsRendered] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const ref = useRef(null);
  const currentPageRef = useRef(null);
  const [currentPageId, setCurrentPageId] = useState(`page_${currPage}`);
  const [scale, setScale] = useState(1);
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      // Do something with the entries, for example log them
      console.log("entries length ", entries.length);
      if (entries.length > 0) {
        for (const width in PDF_SCALE) {
          if (entries[0].target.clientWidth > width) {
            setScale(PDF_SCALE[width]);
            console.log("width ", width, entries[0].target.clientWidth);
            onScaleChange(PDF_SCALE[width]);
          }
        }
      }
    });

    if (ref.current) {
      resizeObserver.observe(window.document.getElementById("root"));
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [onScaleChange]);
  function onDocumentLoadSuccess({ numPages }) {
    setTotalPages(numPages);
  }

  function onRenderSuccess() {
    setIsRendered(true);
  }
  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  const onPageChange = (app, shapes, bindings) => {
    onChangePage(app, shapes, bindings);
  };
  const onPageNext = () => {
    onPDFPageChange(currPage + 1);
    setCurrentPageId(`page_${currPage + 1}`);
  };
  const onPagePrev = () => {
    onPDFPageChange(currPage - 1);
    setCurrentPageId(`page_${currPage - 1}`);
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
          key={`page_${currPage}`}
          pageNumber={currPage}
          onRenderSuccess={onRenderSuccess}
          scale={scale}
        />
      </Document>
      <TlDraw.Tldraw
        autofocus
        // currentPageId={currentPageId}
        disableAssets={false}
        showSponsorLink={false}
        showMenu={false}
        onChangePage={onPageChange}
        onMount={onMount}
        showPages={false}
        showZoom={false}
        readOnly={!amIWhiteboardOwner}
        // onChange={onChange}
      />
      {isRendered && amIWhiteboardOwner ? (
        <Flex
          css={{
            background: "gray",
            text: "white",
            position: "absolute",
            zIndex: "5",
          }}
        >
          <Button outlined onClick={onPagePrev} disabled={currPage === 1}>
            Prev
          </Button>
          <Button
            outlined
            onClick={onPageNext}
            disabled={currPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      ) : (
        <></>
      )}
    </Box>
  );
}

export default PDFViewer;
