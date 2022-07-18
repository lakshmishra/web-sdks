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
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && element.style.transform) {
        e.stopPropagation();
        element.style.transform = "scale(1)";
        element.style["transform-origin"] = "0 0";
      }
    });
    element.addEventListener("wheel", e => {
      e.preventDefault();
      scale += e.deltaY * -factor;
      // Restrict scale
      scale = Math.min(Math.max(1, scale), max_scale);
      element.style["transform-origin"] = `${e.clientX}px ${e.clientY}px`;
      // Apply scale transform
      element.style.transform = `scale(${scale})`;
    });
  }, []);
  return ref;
};
