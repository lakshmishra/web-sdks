import { useEffect, useRef } from "react";

export const useVideoZoom = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const factor = 0.01;
    const max_scale = 1.425;
    let scale = 1;
    const element = ref.current;
    let start = { x: 0, y: 0 };
    let last = { x: 0, y: 0 };
    let isDown = false;
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && element.style.transform) {
        e.stopPropagation();
        scale = 1;
        element.style.transform = `matrix(${scale}, 0 , 0, ${scale}, 0, 0)`;
      }
    });
    element.addEventListener("wheel", e => {
      e.preventDefault();
      scale += e.deltaY * -factor;
      // Restrict scale
      scale = Math.min(Math.max(1, scale), max_scale);
      // Apply scale transform
      element.style.transform = `matrix(${scale}, 0 , 0, ${scale}, 0, 0)`;
    });

    function startDrag(event) {
      start.x = event.clientX - last.x;
      start.y = event.clientY - last.y;
      isDown = true;
    }

    function stopDrag(event) {
      isDown = false;
      last.x = event.clientX - start.x;
      last.y = event.clientY - start.y;
    }

    function whileDrag(event) {
      const currXPos = event.clientX;
      const currYPos = event.clientY;
      // Allow pan only when scaled
      if (scale === 1 || !isDown) {
        return;
      }
      const position = {
        x: currXPos - start.x,
        y: currYPos - start.y,
      };
      element.style.transform = `matrix(${scale}, 0 , 0, ${scale}, ${position.x}, ${position.y})`;
    }

    element.addEventListener("mousedown", startDrag);
    element.parentElement.addEventListener("mousemove", whileDrag);
    element.parentElement.addEventListener("mouseup", stopDrag);
  }, []);
  return ref;
};
