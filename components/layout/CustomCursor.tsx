"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CursorLabel = string | null;

function pickLabel(el: HTMLElement | null): CursorLabel {
  if (!el) return null;
  const target = el.closest<HTMLElement>(
    "[data-cursor], a, button, [role='button']",
  );
  if (!target) return null;

  const explicit = target.dataset.cursor;
  if (explicit) return explicit;

  const tag = target.tagName.toLowerCase();
  if (tag === "a") {
    const href = target.getAttribute("href") ?? "";
    return /^https?:\/\//.test(href) ? "ouvrir" : "lire";
  }
  if (tag === "button" || target.getAttribute("role") === "button") {
    return "cliquer";
  }
  return null;
}

export function CustomCursor() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<CursorLabel>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    document.body.classList.add("has-custom-cursor");

    let raf = 0;
    let nextX = 0;
    let nextY = 0;

    const apply = () => {
      track.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      nextX = e.clientX;
      nextY = e.clientY;
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    const onOver = (e: PointerEvent) => {
      setLabel(pickLabel(e.target as HTMLElement));
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerenter", onEnter);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerenter", onEnter);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) window.cancelAnimationFrame(raf);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={trackRef}
      aria-hidden
      className="custom-cursor-track"
      data-visible={visible ? "true" : "false"}
    >
      <div className={cn("custom-cursor", label && "custom-cursor--label")}>
        {label}
      </div>
    </div>
  );
}
