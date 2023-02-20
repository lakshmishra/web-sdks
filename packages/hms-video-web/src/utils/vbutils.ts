import { Results as MediaPipeResults, SelfieSegmentation } from '@mediapipe/selfie_segmentation';

export const backgroundRemoval = (videoTrack: MediaStreamTrack) => {
  const { width = 640, height = 480 } = videoTrack.getSettings();
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const bgImage = new Image(width, height);
  bgImage.src = 'https://d2qi07yyjujoxr.cloudfront.net/webapp/vb/hms2.png';
  bgImage.crossOrigin = 'anonymous';

  // instance of SelfieSegmentation object
  const selfieSegmentation = new SelfieSegmentation({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
  });

  // set the model and mode
  selfieSegmentation.setOptions({
    modelSelection: 1,
    selfieMode: true,
  });

  // set the callback function for when it finishes segmenting
  selfieSegmentation.onResults(onResults);
  //@ts-ignore
  const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
  //@ts-ignore
  const trackGenerator = new MediaStreamTrackGenerator({ kind: 'video' });

  let counter = 0;
  // transform function
  const transformer = new TransformStream({
    async transform(videoFrame, controller) {
      // we send the video frame to MediaPipe
      videoFrame.width = videoFrame.displayWidth;
      videoFrame.height = videoFrame.displayHeight;
      if (counter % 2) {
        await selfieSegmentation.send({ image: videoFrame });
      }

      // we create a new videoFrame
      const timestamp = videoFrame.timestamp;
      //@ts-ignore
      const newFrame = new VideoFrame(canvas, { timestamp });

      // we close the current videoFrame and queue the new one
      videoFrame.close();
      controller.enqueue(newFrame);
      counter++;
    },
  });
  trackProcessor.readable.pipeThrough(transformer).pipeTo(trackGenerator.writable);
  const processedStream = new MediaStream();
  processedStream.addTrack(trackGenerator);

  function onResults(results: MediaPipeResults) {
    if (!ctx) {
      return;
    }
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'source-out';
    const pat = ctx.createPattern(bgImage, 'no-repeat');
    ctx.fillStyle = pat!;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Only overwrite missing pixels.
    ctx.globalCompositeOperation = 'destination-atop';
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    ctx.restore();
  }

  return processedStream.getVideoTracks()[0];
};
