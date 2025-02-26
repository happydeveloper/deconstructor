"use client";

import ThemeToggle from "./theme-toggle";
import TTSToggle from "./tts-toggle";

export default function Outbound() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <ThemeToggle />
      <TTSToggle />
    </div>
  );
}
