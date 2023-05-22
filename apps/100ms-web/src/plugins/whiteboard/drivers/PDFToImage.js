import * as PDFJS from "pdfjs-dist";

export const pdfToImage = pdfUrl => {
  // Create a canvas element to render the page
  const canvas = document.createElement("canvas");
  PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;
  return new Promise((resolve, reject) => {
    console.log("url ", new URL(pdfUrl));
    PDFJS.getDocument("./sample.pdf")
      .promise.then(pdf => {
        // Fetch the first page
        console.log("here1");
        return pdf.getPage(1);
      })
      .then(page => {
        // Set the canvas dimensions to match the page
        const viewport = page.getViewport({ scale: 1 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the page on the canvas
        console.log("here2");
        const renderContext = {
          canvasContext: canvas.getContext("2d"),
          viewport,
        };
        return page.render(renderContext).promise;
      })
      .then(() => {
        // Convert the canvas to an image
        const blob = canvas.toBlob();
        const file = new File([blob], "page1");
        console.log("file ", file, blob);
        resolve(file);
      })
      .catch(error => {
        console.error("Error loading PDF:", error);
        reject(error);
      });
  });
};
