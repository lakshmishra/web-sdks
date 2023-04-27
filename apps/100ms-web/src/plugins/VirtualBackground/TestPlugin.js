export class TestPlugin {
  init() {}
  checkSupport() {
    return {
      isSupported: true,
    };
  }
  processVideoFrame(input, output) {
    output.width = input.width;
    output.height = input.height;
    const ctx = output.getContext("2d");
    // ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    // ctx.fillRect(0, 0, input.width, input.height);
    // ctx.globalCompositeOperation = "destination-over";
    const imgData = input.getContext("2d")?.getImageData();
    ctx.putImageData(imgData, 0, 0);
    // ctx.drawImage(
    //   input,
    //   0,
    //   0,
    //   input.width,
    //   input.height,
    //   0,
    //   0,
    //   input.width,
    //   input.height
    // );
  }

  getName() {
    return "TestPlugin";
  }

  getPluginType() {
    return "TRANSFORM";
  }

  stop() {}
}
