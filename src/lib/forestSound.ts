"use client";

import { chapterProgress, chapterScroll } from "./journey";

/**
 * The forest's soundscape, synthesised live with Web Audio (no audio files):
 *
 * - wind in the canopy: soft brown noise, swelling in slow gusts
 * - water: the river (bright, rushing noise) grows louder over the river
 *   and loudest at the waterfall
 * - night: crickets (fast pulsing high tones) and monsoon rain
 *
 * The mix follows the scroll, like the light. Off until the visitor turns it
 * on (browsers only allow sound after a click anyway).
 */

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  wind: GainNode;
  water: GainNode;
  rain: GainNode;
  crickets: GainNode;
  frame: number;
};

let engine: Engine | null = null;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Two seconds of noise: white, or brown (deeper, like wind). */
function noiseBuffer(ctx: AudioContext, brown: boolean) {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buffer;
}

function loop(ctx: AudioContext, buffer: AudioBuffer) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.start();
  return source;
}

/** How far into the night (0…1) and how near the water (0…1) the scroll is. */
function mixAt() {
  const y = window.scrollY;
  const night = smooth(chapterScroll("experience", 0.75), chapterScroll("contact", 0.22), y);
  const river = Math.max(
    // over the river in the flight, and along it for the projects
    1 - Math.abs(chapterProgress("flight") - 0.5) * 1.6,
    1 - Math.abs(chapterProgress("projects") - 0.5) * 1.4,
  );
  const falls = 1 - Math.abs(chapterProgress("experience") - 0.45) * 1.5;
  return { night, water: clamp01(Math.max(river * 0.55, falls)), canopy: 1 - Math.abs(chapterProgress("about") - 0.5) * 1.2 };
}

function start(): Engine {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const brown = noiseBuffer(ctx, true);
  const white = noiseBuffer(ctx, false);

  // Wind: brown noise, lowpassed, gusting with a slow LFO
  const wind = ctx.createGain();
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.value = 520;
  loop(ctx, brown).connect(windFilter).connect(wind).connect(master);
  const gust = ctx.createOscillator();
  const gustDepth = ctx.createGain();
  gust.frequency.value = 0.07;
  gustDepth.gain.value = 220;
  gust.connect(gustDepth).connect(windFilter.frequency);
  gust.start();

  // Water: white noise, band-passed into a rush
  const water = ctx.createGain();
  const waterFilter = ctx.createBiquadFilter();
  waterFilter.type = "bandpass";
  waterFilter.frequency.value = 1100;
  waterFilter.Q.value = 0.6;
  loop(ctx, white).connect(waterFilter).connect(water).connect(master);

  // Rain: white noise, high-passed, crackly
  const rain = ctx.createGain();
  const rainFilter = ctx.createBiquadFilter();
  rainFilter.type = "highpass";
  rainFilter.frequency.value = 2400;
  loop(ctx, white).connect(rainFilter).connect(rain).connect(master);

  // Crickets: a high tone pulsed fast, in slow bursts
  const crickets = ctx.createGain();
  const tone = ctx.createOscillator();
  tone.frequency.value = 4600;
  const pulse = ctx.createGain();
  pulse.gain.value = 0;
  const trill = ctx.createOscillator();
  trill.type = "square";
  trill.frequency.value = 28;
  const trillDepth = ctx.createGain();
  trillDepth.gain.value = 0.5;
  trill.connect(trillDepth).connect(pulse.gain);
  const burst = ctx.createOscillator();
  burst.frequency.value = 0.6;
  const burstDepth = ctx.createGain();
  burstDepth.gain.value = 0.5;
  burst.connect(burstDepth).connect(pulse.gain);
  tone.connect(pulse).connect(crickets).connect(master);
  for (const o of [tone, trill, burst]) o.start();

  const e: Engine = { ctx, master, wind, water, rain, crickets, frame: 0 };
  for (const g of [wind, water, rain, crickets]) g.gain.value = 0;

  // Follow the scroll: re-mix a few times a second, gliding between levels
  const remix = () => {
    const { night, water: near, canopy } = mixAt();
    const t = ctx.currentTime;
    e.wind.gain.setTargetAtTime(0.16 + (1 - near) * 0.1 + clamp01(canopy) * 0.05, t, 0.6);
    e.water.gain.setTargetAtTime(near * 0.22, t, 0.6);
    e.rain.gain.setTargetAtTime(night * 0.07, t, 0.8);
    e.crickets.gain.setTargetAtTime(night * 0.012, t, 0.8);
  };
  remix();
  e.frame = window.setInterval(remix, 250);

  master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
  return e;
}

/** Turn the soundscape on or off (fades in and out). */
export function setForestSound(on: boolean) {
  if (on) {
    if (!engine) engine = start();
    else {
      void engine.ctx.resume();
      engine.master.gain.setTargetAtTime(0.9, engine.ctx.currentTime, 0.8);
    }
    return;
  }
  if (!engine) return;
  const e = engine;
  e.master.gain.setTargetAtTime(0, e.ctx.currentTime, 0.25);
  window.setTimeout(() => {
    if (e.master.gain.value < 0.05) void e.ctx.suspend();
  }, 1200);
}
