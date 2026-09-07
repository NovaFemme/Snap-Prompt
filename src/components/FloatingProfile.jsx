import React from "react";
import { Maximize2 } from "lucide-react";

const FloatingProfile = ({ picture, name }) => {
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    let lastX = e.screenX;
    let lastY = e.screenY;
    let dragged = false;

    const onMouseMove = (mv) => {
      const dx = mv.screenX - lastX;
      const dy = mv.screenY - lastY;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) dragged = true;
      lastX = mv.screenX;
      lastY = mv.screenY;
      window.electron?.moveWindow(dx, dy);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (!dragged) window.electron?.restoreWindow();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="w-full h-full bg-transparent" onMouseDown={handleMouseDown}>
      <div className="w-24 h-24 rounded-full overflow-hidden border border-white/20 bg-[#121212] relative group flex items-center justify-center select-none cursor-pointer">
        <img
          src={picture}
          alt={name}
          className="w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <Maximize2 size={24} className="text-white drop-shadow-md" />
        </div>
      </div>
    </div>
  );
};

export default FloatingProfile;
