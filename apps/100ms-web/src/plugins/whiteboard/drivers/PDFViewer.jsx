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
import "./PDFViewer.css";

function PDFViewer(isPdf) {
  const [file, setFile] = useState(
    "https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK"
  );
  const [isRendered, setIsRendered] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const currentPageRef = useRef(null);
  const clientWidthRef = useRef(document.body.clientWidth);
  // const editorRef = useRef(null);
  const [scale, setScale] = useState(1);
  const tldrawContext = useContext(TlDraw.TldrawApp);
  console.log("usecontext ", tldrawContext);
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  // useEffect(() => {
  //   const editor = new TlDraw.Tldraw({
  //     element: currentPageRef.current,
  //     autofocus: true,
  //     disableAssets: true,
  //     showSponsorLink: false,
  //     showMenu: true,
  //     showPages: true,
  //   });
  //   editorRef.current = editor;
  //   return () => {
  //     editor.destroy();
  //   };
  // }, []);
  useEffect(() => {
    if (clientWidthRef.current > 1440) {
      setScale(1.75);
    } else {
      setScale(1);
    }
  }, []);
  // const renderPage = useCallback(() => {
  //   console.log("render ");
  //   currentPageRef.current.addEventListener("click", () => {
  //     editorRef.current.open({
  //       imageUrl: currentPageRef.current.toDataURL(),
  //       width: currentPageRef.current.widht,
  //       height: currentPageRef.current.height,
  //     });
  //   });
  // }, []);
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
  }, [isRendered]);
  const onPageChange = data => {
    console.log(data);
  };
  return (
    <Box
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
      />
    </Box>
  );
}

export default PDFViewer;
