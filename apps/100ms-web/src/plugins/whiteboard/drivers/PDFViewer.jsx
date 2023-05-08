import React, { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import * as TlDraw from "@tldraw/tldraw";
import "./PDFViewer.css";

function PDFViewer(isPdf) {
  const [file, setFile] = useState(
    "https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK"
  );
  const [numPages, setNumPages] = useState(1);
  const currentPageRef = useRef(null);
  const editorRef = useRef(null);
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

  const renderPage = useCallback(() => {
    console.log("render ");
    currentPageRef.current.addEventListener("click", () => {
      editorRef.current.open({
        imageUrl: currentPageRef.current.toDataURL(),
        width: currentPageRef.current.widht,
        height: currentPageRef.current.height,
      });
    });
  }, []);
  function onDocumentLoadSuccess({ numPages }) {
    console.log("loading", numPages);
    setNumPages(numPages);
    // renderPage();
  }
  return (
    <div>
      <TlDraw.Tldraw
        autofocus
        disableAssets={true}
        showSponsorLink={false}
        showPages={false}
        showMenu={false}
      />
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="pdf_document"
      >
        <Page
          canvasRef={currentPageRef}
          key={`page_${numPages}`}
          pageNumber={numPages}
          className=""
        />
      </Document>
    </div>
  );
}

export default PDFViewer;
