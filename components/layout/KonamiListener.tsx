"use client";

import { useEffect } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const DURATION_MS = 5000;
const CLASS = "konami-shake";

export function KonamiListener() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const buffer: string[] = [];
    let timer: number | undefined;

    const trigger = () => {
      document.body.classList.add(CLASS);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.body.classList.remove(CLASS);
      }, DURATION_MS);
    };

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buffer.push(key);
      if (buffer.length > SEQUENCE.length) buffer.shift();
      if (buffer.length !== SEQUENCE.length) return;
      const match = SEQUENCE.every((k, i) => buffer[i] === k);
      if (match) trigger();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
      document.body.classList.remove(CLASS);
    };
  }, []);

  return null;
}
