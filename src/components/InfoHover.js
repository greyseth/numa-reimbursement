import { useEffect, useState } from "react";

export default function InfoHover({ message }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e) {
      setPos({ x: e.clientX, y: e.clientY });
    }

    document.body.addEventListener("mousemove", handleMove);
    return document.body.addEventListener("mousemove", handleMove);
  }, []);

  return (
    <p
      className="fixed p-2 text-xs text-white bg-black rounded max-w-64 pointer-events-none"
      style={{ left: `${pos.x}px`, top: `${pos.y}px`, zIndex: 1000 }}
    >
      {message}
    </p>
  );
}
