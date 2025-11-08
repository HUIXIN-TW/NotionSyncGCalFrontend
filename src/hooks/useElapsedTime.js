"use client";

import { useEffect, useState } from "react";

// startMs = timestamp when action started (e.g. Date.now())
export function useElapsedTime(startMs) {
  const [elapsed, setElapsed] = useState(() => {
    if (!startMs) return 0;
    return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  });

  useEffect(() => {
    if (!startMs) return;
    const id = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [startMs]);

  return elapsed;
}
