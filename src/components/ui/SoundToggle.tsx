"use client";

import { useState } from "react";

/**
 * Turns the forest's sound on and off. Off by default; the sound engine
 * (lib/forestSound) is only loaded on the first click.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    const { setForestSound } = await import("@/lib/forestSound");
    setForestSound(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title={on ? "Mute the forest" : "Hear the forest"}
      className="btn btn--glass pointer-events-auto px-3.5!"
    >
      {/* Sound bars: still when off, swaying when on */}
      <span aria-hidden="true" className={`sound-bars ${on ? "sound-bars--on" : ""}`}>
        <i />
        <i />
        <i />
        <i />
      </span>
      {/* Named by its text ("Forest sound"); on or off is told by aria-pressed */}
      <span className="sr-only">Forest </span>
      <span className="sr-only text-sm sm:not-sr-only">Sound</span>
    </button>
  );
}
