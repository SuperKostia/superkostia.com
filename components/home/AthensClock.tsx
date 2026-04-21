"use client";

import { useSyncExternalStore } from "react";

const FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Athens",
  hour: "2-digit",
  minute: "2-digit",
});

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 30_000);
  return () => window.clearInterval(id);
}

function getSnapshot(): string {
  return FORMATTER.format(new Date());
}

function getServerSnapshot(): string {
  return "--:--";
}

export function AthensClock() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <span suppressHydrationWarning>{time}</span>;
}
