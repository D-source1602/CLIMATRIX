 // @ts-nocheck

import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import CapabilitiesModal from "./components/CapabilitiesModal";
 
// ── STORAGE ──────────────────────────────────────────────────────────────────
const S = {
  get: (k, d) => { try { const v = localStorage.getItem(`cc_${k}`); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(`cc_${k}`, JSON.stringify(v)); } catch {} },
};
 
// ── GLOBAL CSS ────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Oswald:wght@300;400;500;600;700&display=swap');
 
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow-x: hidden; }
 
:root {
  --paper:   #f0ebe0;
  --paper2:  #e8e2d4;
  --paper3:  #ddd6c4;
  --ink:     #1a1410;
  --ink2:    #2e2618;
  --ink3:    #3d3020;
  --ink4:    rgba(26,20,16,0.5);
  --ink5:    rgba(26,20,16,0.25);
  --smoke:   rgba(60,50,35,0.15);
  --red:     #c0392b;
  --redx:    rgba(192,57,43,0.12);
  --amber:   #d35400;
  --amberx:  rgba(211,84,0,0.12);
  --blue:    #1a5276;
  --bluex:   rgba(26,82,118,0.10);
  --green:   #1e8449;
  --greenx:  rgba(30,132,73,0.10);
  --sketch:  #2c2416;
 
  --font-title: 'Oswald', sans-serif;
  --font-body:  'Courier Prime', monospace;
  --font-hand:  'Special Elite', cursive;
}
 
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  cursor: crosshair;
}
 
/* ── SKETCH TEXTURE ── */
.sketch-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E"),
    repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(26,20,16,0.025) 28px, rgba(26,20,16,0.025) 29px),
    repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(26,20,16,0.015) 28px, rgba(26,20,16,0.015) 29px);
  background-size: 400px 400px, 100% 100%, 100% 100%;
}
 
/* ── KEYFRAMES ── */
@keyframes smokeRise  { 0%{transform:translateY(0) translateX(0) scaleX(1);opacity:0.7} 50%{transform:translateY(-80px) translateX(15px) scaleX(1.4);opacity:0.4} 100%{transform:translateY(-160px) translateX(-10px) scaleX(2);opacity:0} }
@keyframes smokeRise2 { 0%{transform:translateY(0) translateX(0) scaleX(1);opacity:0.5} 50%{transform:translateY(-70px) translateX(-12px) scaleX(1.3);opacity:0.3} 100%{transform:translateY(-150px) translateX(8px) scaleX(1.8);opacity:0} }
@keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes orbit      { from{transform:rotate(0deg) translateX(110px) rotate(0deg)} to{transform:rotate(360deg) translateX(110px) rotate(-360deg)} }
@keyframes orbitSlow  { from{transform:rotate(0deg) translateX(150px) rotate(0deg)} to{transform:rotate(-360deg) translateX(150px) rotate(360deg)} }
@keyframes fadeUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn     { from{opacity:0} to{opacity:1} }
@keyframes slideR     { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
@keyframes dash       { to{stroke-dashoffset:0} }
@keyframes pulseDot   { 0%,100%{r:3;opacity:1} 50%{r:6;opacity:0.5} }
@keyframes vortex     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes vortexR    { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
@keyframes drawLine   { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
@keyframes blink      { 0%,100%{opacity:1} 49%{opacity:1} 50%,99%{opacity:0} }
@keyframes scanH      { 0%{top:-3px} 100%{top:100%} }
@keyframes tiltFloat  { 0%,100%{transform:perspective(900px) rotateY(-8deg) rotateX(3deg) translateY(0px)} 50%{transform:perspective(900px) rotateY(-8deg) rotateX(3deg) translateY(-8px)} }
@keyframes dataFlow   { 0%{stroke-dashoffset:200;opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{stroke-dashoffset:0;opacity:0} }
@keyframes typeIn     { from{width:0;overflow:hidden} to{width:100%;overflow:hidden} }
@keyframes countNum   { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
@keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-3px)} 40%{transform:translateX(3px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} }
@keyframes spinSlow   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes heatPulse  { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
 
/* ── SKETCH PANEL ── */
.sketch-panel {
  background: rgba(240,235,224,0.85);
  border: 2px solid var(--ink3);
  position: relative;
  box-shadow: 3px 3px 0 var(--ink5), 6px 6px 0 var(--ink5), inset 0 0 40px rgba(26,20,16,0.04);
  border-radius: 1px;
}
.sketch-panel::before {
  content: '';
  position: absolute; inset: 3px;
  border: 1px solid var(--ink5);
  border-radius: 1px;
  pointer-events: none;
}
 
/* Corner brackets */
.bracket::after {
  content: '';
  position: absolute;
  top: -3px; left: -3px; right: -3px; bottom: -3px;
  border-top: 3px solid var(--ink3);
  border-left: 3px solid var(--ink3);
  border-right: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-radius: 2px;
  pointer-events: none;
}
 
/* ── BUTTONS ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: 2px solid var(--ink3);
  background: var(--paper2);
  color: var(--ink);
  padding: 0 18px; height: 38px;
  font-family: var(--font-body); font-size: 13px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer; transition: all 0.15s ease;
  box-shadow: 3px 3px 0 var(--ink4);
  position: relative;
}
.btn:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--ink4); background: var(--paper3); }
.btn:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 var(--ink4); }
.btn-primary { background: var(--ink2); color: var(--paper); border-color: var(--ink); box-shadow: 3px 3px 0 var(--ink3); }
.btn-primary:hover { background: var(--ink); }
.btn-danger  { border-color: var(--red); color: var(--red); box-shadow: 3px 3px 0 rgba(192,57,43,0.3); }
.btn-danger:hover { background: var(--redx); }
.btn-sm { height: 30px; padding: 0 12px; font-size: 11px; box-shadow: 2px 2px 0 var(--ink4); }
.btn-xs { height: 24px; padding: 0 9px; font-size: 10px; box-shadow: 2px 2px 0 var(--ink4); }
 
/* ── INPUTS ── */
.inp {
  width: 100%;
  background: rgba(255,255,255,0.7);
  border: 2px solid var(--ink3);
  color: var(--ink);
  padding: 0 12px; height: 40px;
  font-family: var(--font-body); font-size: 13px;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: inset 2px 2px 4px rgba(26,20,16,0.06);
}
.inp:focus { border-color: var(--ink); box-shadow: 3px 3px 0 var(--ink4), inset 2px 2px 4px rgba(26,20,16,0.06); }
.inp::placeholder { color: var(--ink4); font-style: italic; }
.inp option { background: var(--paper); }
textarea.inp { height: auto; padding: 10px 12px; resize: vertical; }
 
/* ── LABEL ── */
.lbl { font-family: var(--font-hand); font-size: 11px; letter-spacing: 0.08em; color: var(--ink3); margin-bottom: 6px; display: block; }
 
/* ── BADGE ── */
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border: 1.5px solid; font-family: var(--font-body); font-size: 10px; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase; }
.badge::before { content: '●'; font-size: 7px; animation: blink 2s step-end infinite; }
.b-green  { border-color: var(--green);  color: var(--green);  background: var(--greenx); }
.b-amber  { border-color: var(--amber);  color: var(--amber);  background: var(--amberx); }
.b-red    { border-color: var(--red);    color: var(--red);    background: var(--redx);   }
.b-blue   { border-color: var(--blue);   color: var(--blue);   background: var(--bluex);  }
 
/* ── TABLE ── */
.tbl { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
.tbl th { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink4); padding: 7px 12px; text-align: left; border-bottom: 2px solid var(--ink3); font-family: var(--font-hand); }
.tbl td { padding: 10px 12px; border-bottom: 1px solid var(--ink5); font-size: 13px; transition: background 0.15s; }
.tbl tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover td { background: rgba(26,20,16,0.04); }
 
/* ── SECTION TITLE ── */
.stitle {
  font-family: var(--font-title); font-size: 13px; font-weight: 500;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink2);
  margin-bottom: 18px; display: flex; align-items: center; gap: 10px;
}
.stitle::after { content: ''; flex: 1; height: 2px; background: repeating-linear-gradient(90deg, var(--ink3) 0, var(--ink3) 4px, transparent 4px, transparent 8px); }
 
/* ── PROGRESS ── */
.prog { height: 6px; background: rgba(26,20,16,0.1); border: 1px solid var(--ink4); position: relative; overflow: hidden; }
.prog-fill { height: 100%; transition: width 1s cubic-bezier(.4,0,.2,1); background: repeating-linear-gradient(45deg, var(--ink3) 0, var(--ink3) 4px, transparent 4px, transparent 8px); position: relative; }
 
/* ── NAV ── */
.nav-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  font-family: var(--font-title); font-size: 13px; font-weight: 400; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ink4);
  cursor: pointer; transition: all 0.2s; border: 1.5px solid transparent; background: none; white-space: nowrap;
}
.nav-btn:hover { color: var(--ink); border-color: var(--ink4); background: rgba(26,20,16,0.04); }
.nav-btn.active { color: var(--ink); border-color: var(--ink3); background: rgba(26,20,16,0.07); box-shadow: 2px 2px 0 var(--ink5); }
.nav-indicator { width: 5px; height: 5px; border-radius: 50%; background: var(--ink); flex-shrink: 0; opacity: 0; transition: opacity 0.2s; }
.nav-btn.active .nav-indicator { opacity: 1; animation: blink 1.5s step-end infinite; }
 
/* ── TOOLTIP ── */
.rtip { background: var(--paper2) !important; border: 2px solid var(--ink3) !important; border-radius: 0 !important; box-shadow: 4px 4px 0 var(--ink5) !important; font-family: var(--font-body) !important; font-size: 12px !important; }
 
/* ── ANIMATIONS ── */
.a0 { animation: fadeUp .5s ease both; }
.a1 { animation: fadeUp .5s .06s ease both; }
.a2 { animation: fadeUp .5s .12s ease both; }
.a3 { animation: fadeUp .5s .18s ease both; }
.a4 { animation: fadeUp .5s .24s ease both; }
.a5 { animation: fadeUp .5s .30s ease both; }
 
/* ── SMOKE ── */
.smoke-puff { position: absolute; border-radius: 50%; filter: blur(14px); pointer-events: none; }
.sp1 { animation: smokeRise 4s ease-out infinite; }
.sp2 { animation: smokeRise2 5s ease-out infinite 0.8s; }
.sp3 { animation: smokeRise 4.5s ease-out infinite 1.6s; }
.sp4 { animation: smokeRise2 5.5s ease-out infinite 2.4s; }
 
/* ── TABLET TILT ── */
.tablet-wrap { animation: tiltFloat 5s ease-in-out infinite; transform-origin: center; }
 
/* ── HATCH FILL ── */
.hatch { background: repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(26,20,16,0.07) 3px, rgba(26,20,16,0.07) 4px); }
 
/* ── STAT VALUE ── */
.sv { font-family: var(--font-title); font-size: 38px; font-weight: 700; line-height: 1; color: var(--ink); letter-spacing: -0.01em; }
 
/* ── LIVE INDICATOR ── */
.live { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body); font-size: 10px; letter-spacing: 0.1em; color: var(--green); font-weight: 700; }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: blink 1s step-end infinite; }
 
/* ── SKETCH LINE ── */
.sketch-line { border: none; border-top: 2px solid; border-image: repeating-linear-gradient(90deg, var(--ink3) 0, var(--ink3) 4px, transparent 4px, transparent 9px) 1; margin: 0; }
 
/* SCAN ── */
.scanline { position: fixed; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, rgba(26,20,16,0.15), transparent); animation: scanH 10s linear infinite; pointer-events: none; z-index: 9999; }
`;
 
// ── ANIMATED NUMBER ───────────────────────────────────────────────────────────
const AnimNum = ({ to, dur = 1200, dec = 0 }) => {
  const [v, setV] = useState(0);
  const t0 = useRef(null);
  useEffect(() => {
    const target = parseFloat(to) || 0;
    t0.current = performance.now();
    const tick = now => {
      const p = Math.min((now - t0.current) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(+(target * e).toFixed(dec));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  return <>{v}</>;
};
 
// ── SMOKE COLUMN ─────────────────────────────────────────────────────────────
const SmokeColumn = ({ x, delay = 0 }) => (
  <div style={{ position: 'absolute', left: x, bottom: 0, width: 40 }}>
    {[0,1,2,3].map(i => (
      <div key={i} className={`smoke-puff sp${i+1}`} style={{
        width: 28 + i * 8, height: 28 + i * 8,
        background: `rgba(40,30,20,${0.18 - i * 0.03})`,
        left: -6 + i * 2, bottom: 0,
        animationDelay: `${delay + i * 0.4}s`,
      }} />
    ))}
  </div>
);
 
// ── FACTORY SVG ───────────────────────────────────────────────────────────────
const FactorySVG = () => (
  <svg viewBox="0 0 800 300" style={{ width: '100%', height: '100%' }} fill="none">
    {/* Sketch hatch ground */}
    <rect x="0" y="260" width="800" height="40" fill="rgba(26,20,16,0.08)"
      style={{ backgroundImage: 'repeating-linear-gradient(45deg,#1a1410 0,#1a1410 1px,transparent 1px,transparent 6px)' }} />
 
    {/* Main factory */}
    <rect x="140" y="140" width="220" height="120" stroke="#2c2416" strokeWidth="2" fill="rgba(240,235,224,0.6)"
      style={{ filter: 'url(#sketch)' }} />
    <rect x="150" y="150" width="90" height="50" stroke="#2c2416" strokeWidth="1.5" fill="rgba(26,20,16,0.08)" strokeDasharray="2 1" />
    <rect x="255" y="150" width="90" height="50" stroke="#2c2416" strokeWidth="1.5" fill="rgba(26,20,16,0.08)" strokeDasharray="2 1" />
    {/* Door */}
    <rect x="210" y="210" width="40" height="50" stroke="#2c2416" strokeWidth="2" fill="rgba(26,20,16,0.12)" />
    {/* Windows */}
    <rect x="158" y="158" width="30" height="20" stroke="#2c2416" strokeWidth="1" fill="none" />
    <line x1="173" y1="158" x2="173" y2="178" stroke="#2c2416" strokeWidth="1" />
    <line x1="158" y1="168" x2="188" y2="168" stroke="#2c2416" strokeWidth="1" />
 
    {/* Tall chimney 1 */}
    <rect x="175" y="40" width="22" height="110" stroke="#2c2416" strokeWidth="2.5" fill="rgba(240,235,224,0.8)" />
    <rect x="170" y="38" width="32" height="10" stroke="#2c2416" strokeWidth="2" fill="rgba(240,235,224,0.9)" />
    {/* Chimney 2 */}
    <rect x="230" y="70" width="18" height="80" stroke="#2c2416" strokeWidth="2" fill="rgba(240,235,224,0.8)" />
    <rect x="226" y="68" width="26" height="8" stroke="#2c2416" strokeWidth="1.5" fill="rgba(240,235,224,0.9)" />
    {/* Chimney 3 */}
    <rect x="285" y="55" width="20" height="90" stroke="#2c2416" strokeWidth="2" fill="rgba(240,235,224,0.8)" />
    <rect x="281" y="53" width="28" height="9" stroke="#2c2416" strokeWidth="1.5" fill="rgba(240,235,224,0.9)" />
 
    {/* Small building right */}
    <rect x="400" y="180" width="100" height="80" stroke="#2c2416" strokeWidth="1.5" fill="rgba(240,235,224,0.5)" />
    <rect x="410" y="190" width="25" height="20" stroke="#2c2416" strokeWidth="1" fill="rgba(26,20,16,0.06)" strokeDasharray="2 1" />
    <rect x="460" y="190" width="25" height="20" stroke="#2c2416" strokeWidth="1" fill="rgba(26,20,16,0.06)" strokeDasharray="2 1" />
    {/* Small chimney right */}
    <rect x="430" y="130" width="14" height="60" stroke="#2c2416" strokeWidth="1.5" fill="rgba(240,235,224,0.7)" />
    <rect x="427" y="128" width="20" height="7" stroke="#2c2416" strokeWidth="1" fill="rgba(240,235,224,0.9)" />
 
    {/* Pipes and details */}
    <path d="M360 220 Q380 200 400 220" stroke="#2c2416" strokeWidth="2" fill="none" strokeDasharray="3 2" />
    <circle cx="360" cy="220" r="5" stroke="#2c2416" strokeWidth="1.5" fill="rgba(240,235,224,0.9)" />
    <circle cx="400" cy="220" r="5" stroke="#2c2416" strokeWidth="1.5" fill="rgba(240,235,224,0.9)" />
 
    {/* IoT sensor nodes */}
    <circle cx="186" cy="35" r="6" stroke="#1a5276" strokeWidth="2" fill="rgba(26,82,118,0.1)" />
    <line x1="186" y1="29" x2="186" y2="15" stroke="#1a5276" strokeWidth="1.5" strokeDasharray="2 2" />
    <circle cx="186" cy="12" r="3" stroke="#1a5276" strokeWidth="1.5" fill="#1a5276" style={{ animation: 'blink 1.5s step-end infinite' }} />
 
    <circle cx="241" cy="65" r="5" stroke="#1a5276" strokeWidth="1.5" fill="rgba(26,82,118,0.1)" />
    <line x1="241" y1="60" x2="241" y2="48" stroke="#1a5276" strokeWidth="1.2" strokeDasharray="2 2" />
    <circle cx="241" cy="45" r="2.5" stroke="#1a5276" strokeWidth="1.5" fill="#1a5276" style={{ animation: 'blink 2s step-end infinite 0.5s' }} />
 
    <circle cx="295" cy="50" r="5" stroke="#1a5276" strokeWidth="1.5" fill="rgba(26,82,118,0.1)" />
    <line x1="295" y1="45" x2="295" y2="33" stroke="#1a5276" strokeWidth="1.2" strokeDasharray="2 2" />
    <circle cx="295" cy="30" r="2.5" stroke="#1a5276" strokeWidth="1.5" fill="#1a5276" style={{ animation: 'blink 2.5s step-end infinite 1s' }} />
 
    {/* Labels */}
    <text x="215" y="115" fontFamily="Special Elite" fontSize="9" fill="#1a5276" textAnchor="middle">IoT SENSORS</text>
    <path d="M186 12 Q300 -10 600 30" stroke="#1a5276" strokeWidth="1" fill="none" strokeDasharray="4 3" opacity="0.5" />
 
    {/* Ground detail lines */}
    <line x1="0" y1="262" x2="800" y2="262" stroke="#2c2416" strokeWidth="2" />
    <line x1="50" y1="270" x2="140" y2="270" stroke="#2c2416" strokeWidth="1" opacity="0.4" />
    <line x1="500" y1="270" x2="700" y2="270" stroke="#2c2416" strokeWidth="1" opacity="0.4" />
 
    {/* Small building far left */}
    <rect x="20" y="200" width="80" height="60" stroke="#2c2416" strokeWidth="1.5" fill="rgba(240,235,224,0.4)" />
    <rect x="30" y="210" width="20" height="16" stroke="#2c2416" strokeWidth="1" fill="none" strokeDasharray="2 1" />
    <rect x="58" y="210" width="20" height="16" stroke="#2c2416" strokeWidth="1" fill="none" strokeDasharray="2 1" />
    <rect x="42" y="226" width="20" height="34" stroke="#2c2416" strokeWidth="1.5" fill="rgba(26,20,16,0.1)" />
 
    {/* Sketch filter */}
    <defs>
      <filter id="sketch">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);
 
// ── SATELLITE SVG ─────────────────────────────────────────────────────────────
const SatelliteSVG = ({ size = 70 }) => (
  <svg width={size} height={size} viewBox="0 0 70 70" fill="none">
    {/* Body */}
    <rect x="27" y="27" width="16" height="16" rx="2" stroke="#2c2416" strokeWidth="2" fill="rgba(240,235,224,0.9)" />
    <rect x="28" y="28" width="14" height="14" stroke="#2c2416" strokeWidth="1" fill="none" strokeDasharray="3 2" />
    {/* Solar panels L */}
    <rect x="2" y="30" width="20" height="10" rx="1" stroke="#1a5276" strokeWidth="2" fill="rgba(26,82,118,0.15)" />
    <line x1="8" y1="30" x2="8" y2="40" stroke="#1a5276" strokeWidth="1" />
    <line x1="14" y1="30" x2="14" y2="40" stroke="#1a5276" strokeWidth="1" />
    <line x1="22" y1="35" x2="27" y2="35" stroke="#2c2416" strokeWidth="1.5" />
    {/* Solar panels R */}
    <rect x="48" y="30" width="20" height="10" rx="1" stroke="#1a5276" strokeWidth="2" fill="rgba(26,82,118,0.15)" />
    <line x1="54" y1="30" x2="54" y2="40" stroke="#1a5276" strokeWidth="1" />
    <line x1="60" y1="30" x2="60" y2="40" stroke="#1a5276" strokeWidth="1" />
    <line x1="43" y1="35" x2="48" y2="35" stroke="#2c2416" strokeWidth="1.5" />
    {/* Antenna */}
    <line x1="35" y1="27" x2="35" y2="12" stroke="#2c2416" strokeWidth="1.5" strokeDasharray="3 2" />
    <circle cx="35" cy="10" r="3" stroke="#2c2416" strokeWidth="1.5" fill="rgba(192,57,43,0.4)" style={{ animation: 'blink 1.2s step-end infinite' }} />
    {/* Beam dashes */}
    <line x1="28" y1="43" x2="10" y2="65" stroke="#1a5276" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    <line x1="35" y1="43" x2="35" y2="65" stroke="#1a5276" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
    <line x1="42" y1="43" x2="60" y2="65" stroke="#1a5276" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
  </svg>
);
 
// ── VORTEX AI CORE ────────────────────────────────────────────────────────────
const VortexCore = ({ size = 90 }) => {
  const svgRef = useRef(null);
  return (
    <svg ref={svgRef} width={size} height={size} viewBox="0 0 90 90" fill="none">
      {[34, 26, 18, 10].map((r, i) => (
        <circle key={i} cx="45" cy="45" r={r}
          stroke="#2c2416" strokeWidth={1.5 - i * 0.3}
          strokeDasharray={`${6 - i} ${3 + i}`}
          fill="none" opacity={0.4 + i * 0.15}
          style={{ animation: `${i % 2 === 0 ? 'vortex' : 'vortexR'} ${3 + i * 1.5}s linear infinite`, transformOrigin: '45px 45px' }}
        />
      ))}
      <circle cx="45" cy="45" r="6" fill="rgba(26,20,16,0.8)" stroke="#2c2416" strokeWidth="2" />
      <circle cx="45" cy="45" r="3" fill="var(--ink)" style={{ animation: 'blink 0.8s step-end infinite' }} />
      <text x="45" y="80" fontFamily="Special Elite" fontSize="8" fill="#2c2416" textAnchor="middle" opacity="0.7">AI CORE</text>
    </svg>
  );
};
 
// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rtip" style={{ padding: '10px 14px' }}>
      <div style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)', marginBottom: 8, letterSpacing: '0.1em' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 14, height: 3, background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--ink3)' }}>{p.name}</span>
          <span style={{ fontWeight: 700, marginLeft: 'auto', paddingLeft: 12, color: 'var(--ink)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};
 
// ── SKETCH SCENE HEADER (Login / Hero) ───────────────────────────────────────
const SketchScene = ({ children }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: 'var(--paper)', overflow: 'hidden', display: 'flex' }}>
      <div className="sketch-bg" />
      <div className="scanline" />
 
      {/* Sky texture */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(200,210,220,0.3) 0%, transparent 40%)', pointerEvents: 'none' }} />
 
      {/* Factory scene bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 300, pointerEvents: 'none' }}>
        <FactorySVG />
        {/* Animated smoke */}
        <SmokeColumn x="175px" delay={0} />
        <SmokeColumn x="230px" delay={0.8} />
        <SmokeColumn x="284px" delay={1.6} />
        <SmokeColumn x="430px" delay={0.5} />
      </div>
 
      {/* Satellite orbit top-right */}
      <div style={{ position: 'absolute', top: 80, right: 200, width: 300, height: 300, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -150, marginLeft: -150, width: 300, height: 300, borderRadius: '50%', border: '1px dashed rgba(26,82,118,0.3)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
          <div style={{ position: 'absolute', animation: 'orbit 12s linear infinite', transformOrigin: '0 0' }}>
            <div style={{ marginLeft: -35, marginTop: -35 }}>
              <SatelliteSVG size={70} />
            </div>
          </div>
        </div>
        {/* Center label */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'Special Elite', fontSize: 8, color: 'rgba(26,82,118,0.5)', letterSpacing: '0.2em', textAlign: 'center', lineHeight: 2 }}>
          SATELLITE<br/>VERIFICATION
        </div>
      </div>
 
      {/* AI Core vortex */}
      <div style={{ position: 'absolute', top: 60, right: 80, pointerEvents: 'none' }}>
        <VortexCore size={90} />
        {/* Connection arrows */}
        <svg style={{ position: 'absolute', top: 45, left: 90, width: 140, height: 120, pointerEvents: 'none' }} viewBox="0 0 140 120">
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#2c2416" />
            </marker>
          </defs>
          {[
            [0, 10, 120, 5, 'AQI VERIFICATION'],
            [0, 45, 120, 40, 'AUTO COMPLIANCE'],
            [0, 80, 120, 75, 'PUBLIC HEATMAP'],
          ].map(([x1, y1, x2, y2, label], i) => (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2c2416" strokeWidth="1.5"
                strokeDasharray="4 3" markerEnd="url(#arr)"
                style={{ animation: `drawLine 2s ${i * 0.5}s ease both`, strokeDashoffset: 200 }}
              />
              <text x={x2 + 4} y={y2 + 4} fontFamily="Special Elite" fontSize="8" fill="#2c2416">{label}</text>
            </g>
          ))}
        </svg>
      </div>
 
      {/* Title top-left */}
      <div style={{ position: 'absolute', top: 32, left: 32 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--ink4)', marginBottom: 6 }}>ENVIRONMENTAL INTELLIGENCE SYSTEM</div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 38, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '0.02em' }}>
          CLIMACORE:<br />
          <span style={{ fontSize: 28, color: 'var(--ink3)' }}>AI-POWERED</span><br />
          <span style={{ fontSize: 22, color: 'var(--ink4)', fontWeight: 300 }}>INDUSTRIAL EMISSION<br />INTELLIGENCE</span>
        </div>
      </div>
 
      {children}
    </div>
  );
};
 
// ── LOGIN ─────────────────────────────────────────────────────────────────────
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
 
  const submit = () => {
    if (!role) { setErr('Select clearance level'); return; }
    if (!email || !pass) { setErr('Enter credentials'); return; }
    setLoading(true);
    setTimeout(() => onLogin({ id: Date.now(), name: email.split('@')[0].replace(/[._]/g, ' '), email, role }), 900);
  };
 
  const roles = [
    { v: 'industry',   l: 'Factory Controller',  s: 'Submit & manage emissions' },
    { v: 'government', l: 'Authority Admin',      s: 'Full regulatory oversight' },
    { v: 'citizen',    l: 'Public Observer',      s: 'Environmental transparency' },
  ];
 
  return (
    <SketchScene>
      {/* Login form as a tablet in the scene */}
      <div style={{ position: 'absolute', bottom: 280, right: 0, left: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div className="tablet-wrap" style={{ width: 520 }}>
          {/* Tablet bezel */}
          <div style={{ background: '#1a1410', borderRadius: 12, padding: '18px 18px 28px', boxShadow: '0 20px 60px rgba(26,20,16,0.5), 8px 8px 0 rgba(26,20,16,0.4)', border: '2px solid #0a0a08' }}>
            {/* Camera */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', border: '1px solid #555' }} />
            </div>
            {/* Screen */}
            <div style={{ background: 'var(--paper)', borderRadius: 4, padding: '20px 22px', border: '2px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
              {/* Screen scanline */}
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(26,20,16,0.025) 3px, rgba(26,20,16,0.025) 4px)', pointerEvents: 'none', zIndex: 10 }} />
 
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--ink4)', marginBottom: 4 }}>CLIMACORE INSPECTOR DASHBOARD</div>
              <div className="sketch-line" style={{ marginBottom: 14 }} />
 
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="lbl">OPERATOR ID</label>
                  <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="operator@climacore.env" onKeyDown={e => e.key === 'Enter' && submit()} autoFocus style={{ fontSize: 12, height: 36 }} />
                </div>
                <div>
                  <label className="lbl">AUTH CODE</label>
                  <input className="inp" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && submit()} style={{ fontSize: 12, height: 36 }} />
                </div>
              </div>
 
              <div style={{ marginBottom: 14 }}>
                <label className="lbl" style={{ marginBottom: 8 }}>CLEARANCE LEVEL</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                  {roles.map(r => (
                    <label key={r.v} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 10px', border: `2px solid ${role === r.v ? 'var(--ink)' : 'var(--ink5)'}`, background: role === r.v ? 'rgba(26,20,16,0.06)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s', boxShadow: role === r.v ? '2px 2px 0 var(--ink4)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name="role" value={r.v} checked={role === r.v} onChange={e => setRole(e.target.value)} style={{ accentColor: 'var(--ink)', width: 12, height: 12 }} />
                        <span style={{ fontFamily: 'var(--font-title)', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', color: role === r.v ? 'var(--ink)' : 'var(--ink3)' }}>{r.l}</span>
                      </div>
                      <span style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', paddingLeft: 18 }}>{r.s}</span>
                    </label>
                  ))}
                </div>
              </div>
 
              {err && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--red)', background: 'var(--redx)', border: '1.5px solid var(--red)', padding: '6px 10px', marginBottom: 12, letterSpacing: '0.05em' }}>⚠ {err}</div>}
 
              {/* Progress bar style login button */}
              <div style={{ position: 'relative' }}>
                <button className="btn btn-primary" onClick={submit} style={{ width: '100%', letterSpacing: '0.2em', fontSize: 12, height: 38 }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(240,235,224,0.3)', borderTopColor: 'var(--paper)', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} />
                      INITIALIZING...
                    </span>
                  ) : 'INITIALIZE SESSION'}
                </button>
                {loading && (
                  <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 4, background: 'rgba(26,20,16,0.1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--paper)', animation: 'typeIn 0.9s ease forwards', width: 0 }} />
                  </div>
                )}
              </div>
 
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontFamily: 'Special Elite', fontSize: 8, color: 'var(--ink4)', letterSpacing: '0.15em' }}>
                <span>PDF NOTICE GENERATION: READY</span>
                <span className="live"><span className="live-dot" style={{ width: 5, height: 5 }} />SECURE</span>
              </div>
            </div>
            {/* Home button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              <div style={{ width: 30, height: 6, borderRadius: 3, background: '#333', border: '1px solid #555' }} />
            </div>
          </div>
        </div>
      </div>
    </SketchScene>
  );
};
 
// ── TOPBAR ────────────────────────────────────────────────────────────────────
const Topbar = ({ user, page, setPage, onLogout, emissions }) => {
  const [time, setTime] = useState(new Date());
  const [showCaps, setShowCaps] = useState(false);
  useEffect(() => { const iv = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(iv); }, []);
  const latest = emissions[0];
  const status = latest ? (latest.co2 > 270 || latest.nox > 50 ? 'CRITICAL' : latest.co2 > 240 ? 'WARNING' : 'NOMINAL') : 'STANDBY';
  const sColor = { CRITICAL: 'var(--red)', WARNING: 'var(--amber)', NOMINAL: 'var(--green)', STANDBY: 'var(--ink4)' }[status];
 
  return (
    <div style={{ background: 'var(--paper2)', borderBottom: '2px solid var(--ink3)', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 0 var(--ink5)' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <VortexCore size={36} />
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--ink)', lineHeight: 1 }}>CLIMACORE</div>
          <div style={{ fontFamily: 'Special Elite', fontSize: 8, color: 'var(--ink4)', letterSpacing: '0.12em' }}>AI-POWERED EMISSION INTELLIGENCE</div>
        </div>
      </div>
 
      {/* Nav */}
      <nav style={{ display: 'flex', gap: 2 }}>
        {['dashboard', 'emissions', 'compliance', 'reports'].map(p => (
          <button key={p} className={`nav-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>
            <span className="nav-indicator" />
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <button className="nav-btn" onClick={() => setShowCaps(true)}>
          <span className="nav-indicator" />
          Capabilities
        </button>
      </nav>
 
      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: sColor, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sColor, display: 'inline-block', animation: 'blink 1.5s step-end infinite' }} />
          {status}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink4)', textAlign: 'right' }}>
          <div>{time.toLocaleTimeString()}</div>
          <div style={{ fontSize: 9, letterSpacing: '0.05em', color: 'var(--ink5)' }}>{user.name.toUpperCase()}</div>
        </div>
        <button className="btn btn-sm btn-danger" onClick={onLogout} style={{ fontSize: 10, letterSpacing: '0.1em' }}>DISCONNECT</button>
      </div>

      <CapabilitiesModal open={showCaps} onClose={() => setShowCaps(false)} />
    </div>
  );
};
 
// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard = ({ emissions, setPage }) => {
  const latest = emissions[0] || {};
  const prev = emissions[1] || {};
  const pct = (a, b) => b ? +((a - b) / b * 100).toFixed(1) : null;
 
  const areaData = [...emissions].reverse().slice(-10).map((e, i) => ({
    d: e.date?.slice(5) || `D${i}`, co2: e.co2 || 0, nox: e.nox || 0, sox: e.sox || 0
  }));
 
  const sys = [
    { n: 'Monitoring Network', v: 97, c: 'var(--green)' },
    { n: 'AI Anomaly Engine', v: 89, c: 'var(--blue)' },
    { n: 'Satellite Feed', v: 94, c: 'var(--ink3)' },
    { n: 'Compliance Engine', v: 76, c: 'var(--amber)' },
  ];
 
  const alerts = [
    { lvl: 'CRITICAL', msg: 'Compliance threshold breached — Facility Gamma', t: '2 min ago', bc: 'b-red' },
    { lvl: 'WARNING',  msg: 'Elevated NOₓ readings in Sector 7', t: '18 min ago', bc: 'b-amber' },
    { lvl: 'INFO',     msg: 'Satellite batch synchronized', t: '34 min ago', bc: 'b-blue' },
    { lvl: 'OK',       msg: 'Monthly compliance report dispatched', t: '1 hr ago', bc: 'b-green' },
  ];

  const mockEmissionReadings = [
    { timestamp: '2026-05-29T10:00:00Z', co2: 120 },
    { timestamp: '2026-05-29T11:00:00Z', co2: 125 },
    { timestamp: '2026-05-29T12:00:00Z', co2: 132 },
    { timestamp: '2026-05-29T13:00:00Z', co2: 128 },
    { timestamp: '2026-05-29T14:00:00Z', co2: 260 },
  ];

  const [anomalyResult, setAnomalyResult] = useState(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [anomalyError, setAnomalyError] = useState('');

  const runAnomalyDetection = async () => {
    setAnomalyLoading(true);
    setAnomalyError('');

    try {
      const response = await fetch('http://localhost:5000/api/v1/anomaly/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          readings: mockEmissionReadings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || data?.summary || 'Anomaly scan failed');
      }

      setAnomalyResult(data);
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      setAnomalyError('Unable to reach anomaly engine. Check that backend is running on port 5000.');
    } finally {
      setAnomalyLoading(false);
    }
  };
 
  const caps = [
    { n: 'Real-Time Monitoring', d: '30-sec sensor refresh · 240 stations' },
    { n: 'AI Anomaly Detection', d: 'ML deviation alerts · 98.7% precision' },
    { n: 'Satellite Verification', d: 'Independent cross-check every 6 hrs' },
    { n: 'CPCB/SPCB Compliance', d: 'Real-time regulatory rule matching' },
    { n: 'Auto Report Generation', d: 'Scheduled PDF + CSV dispatch system' },
    { n: 'Public Heatmap Portal', d: 'Citizen-facing open emissions data' },
  ];
 
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, background: 'var(--paper)' }}>
      {/* Scene strip at top */}
      <div className="sketch-panel a0" style={{ marginBottom: 20, height: 180, position: 'relative', overflow: 'hidden', padding: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <FactorySVG />
          <SmokeColumn x="175px" delay={0} />
          <SmokeColumn x="230px" delay={0.8} />
          <SmokeColumn x="284px" delay={1.6} />
          <SmokeColumn x="430px" delay={0.4} />
        </div>
        {/* Overlay labels */}
        <div style={{ position: 'absolute', top: 12, left: 16 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.1em' }}>OPERATIONAL OVERVIEW</div>
          <div style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)', letterSpacing: '0.2em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
          </div>
        </div>
        {/* Satellite + AI in strip */}
        <div style={{ position: 'absolute', top: 10, right: 160 }}>
          <SatelliteSVG size={50} />
        </div>
        <div style={{ position: 'absolute', top: 6, right: 60 }}>
          <VortexCore size={70} />
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
          <span className="badge b-green">SYSTEM NOMINAL</span>
          <span className="badge b-blue">MONITORING ACTIVE</span>
        </div>
      </div>
 
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { l: 'CO₂ Emissions', v: latest.co2 || 248, u: 't/mo', c: pct(latest.co2, prev.co2) ?? 4.2 },
          { l: 'NOₓ Levels',    v: latest.nox || 44,  u: 'kg',   c: pct(latest.nox, prev.nox) ?? -2.1 },
          { l: 'SOₓ Levels',    v: latest.sox || 11,  u: 'kg',   c: pct(latest.sox, prev.sox) ?? 1.8 },
          { l: 'Air Quality',   v: latest.aqi || 84,  u: 'AQI',  c: pct(latest.aqi, prev.aqi) ?? 3.0 },
          { l: 'Data Records',  v: emissions.length,  u: 'total', c: null },
        ].map((m, i) => (
          <div key={i} className={`sketch-panel a${i+1} hatch`} style={{ padding: '14px 16px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--paper2)', opacity: 0.7 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>{m.l}</div>
              <div className="sv" style={{ fontSize: 32 }}><AnimNum to={m.v} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)' }}>{m.u}</span>
                {m.c !== null && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: m.c > 0 ? 'var(--red)' : 'var(--green)', background: m.c > 0 ? 'var(--redx)' : 'var(--greenx)', border: `1px solid ${m.c > 0 ? 'var(--red)' : 'var(--green)'}`, padding: '1px 6px' }}>
                  {m.c > 0 ? '▲' : '▼'} {Math.abs(m.c)}%
                </span>}
              </div>
            </div>
          </div>
        ))}
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 14 }}>
        {/* Area chart */}
        <div className="sketch-panel a2" style={{ padding: '18px 16px 14px' }}>
          <div className="stitle">Emission Trends</div>
          {areaData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData} margin={{ left: -10, right: 8, top: 4 }}>
                <defs>
                  {[['co2', '#c0392b'], ['nox', '#1e8449'], ['sox', '#1a5276']].map(([k, c]) => (
                    <linearGradient key={k} id={`dg_${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.03} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(26,20,16,0.08)" vertical={false} strokeDasharray="4 3" />
                <XAxis dataKey="d" stroke="transparent" tick={{ fontSize: 10, fontFamily: 'Special Elite', fill: 'var(--ink4)' }} />
                <YAxis stroke="transparent" tick={{ fontSize: 10, fontFamily: 'Special Elite', fill: 'var(--ink4)' }} />
                <Tooltip content={<ChartTip />} />
                <Legend iconSize={10} wrapperStyle={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)', letterSpacing: '0.05em' }} />
                <Area type="monotone" dataKey="co2" name="CO₂" stroke="#c0392b" strokeWidth={2} fill="url(#dg_co2)" />
                <Area type="monotone" dataKey="nox" name="NOₓ" stroke="#1e8449" strokeWidth={2} fill="url(#dg_nox)" />
                <Area type="monotone" dataKey="sox" name="SOₓ" stroke="#1a5276" strokeWidth={2} fill="url(#dg_sox)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'Special Elite', fontSize: 11, color: 'var(--ink4)', letterSpacing: '0.1em' }}>— NO DATA — SUBMIT READINGS —</div>
            </div>
          )}
        </div>
 
        {/* System health */}
        <div className="sketch-panel a3" style={{ padding: '18px' }}>
          <div className="stitle">System Health</div>
          {sys.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.08em' }}>{s.n}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: s.c }}>{s.v}%</span>
              </div>
              <div className="prog">
                <div className="prog-fill" style={{ width: `${s.v}%`, background: `repeating-linear-gradient(45deg, ${s.c} 0, ${s.c} 3px, transparent 3px, transparent 6px)` }} />
              </div>
            </div>
          ))}
 
          {/* Mini satellite + data flow sketch */}
          <div style={{ marginTop: 16, padding: '10px', border: '1px dashed var(--ink4)', background: 'rgba(26,82,118,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SatelliteSVG size={36} />
              <div>
                <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--blue)', letterSpacing: '0.15em' }}>SATELLITE FEED</div>
                <div className="live"><span className="live-dot" />SYNCED 6m ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Alerts */}
        <div className="sketch-panel a4" style={{ padding: '18px' }}>
          <div className="stitle">Active Alerts</div>
          {alerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 10px', marginBottom: 7, border: '1px solid var(--ink5)', background: 'rgba(240,235,224,0.6)', alignItems: 'flex-start' }}>
              <span className={`badge ${a.bc}`} style={{ flexShrink: 0, marginTop: 1 }}>{a.lvl}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.4 }}>{a.msg}</div>
                <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', marginTop: 3 }}>{a.t}</div>
              </div>
            </div>
          ))}
        </div>
 
        {/* Platform caps */}
<div className="sketch-panel a5" style={{ padding: '18px' }}>
  <div className="stitle">Capabilities</div>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
    {caps.map((cap, i) => (
      <div
        key={i}
        onClick={() => {
          if (cap.n === "Public Heatmap Portal") {
            setPage("heatmap");
          }
        }}
        style={{
          padding: '10px 12px',
          border: '1px solid var(--ink5)',
          background: 'rgba(240,235,224,0.5)',
          transition: 'all 0.2s',
          cursor:
            cap.n === "Public Heatmap Portal"
              ? 'pointer'
              : 'default'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--ink3)';
          e.currentTarget.style.background = 'rgba(26,20,16,0.06)';
          e.currentTarget.style.transform = 'translate(-1px,-1px)';
          e.currentTarget.style.boxShadow = '2px 2px 0 var(--ink5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--ink5)';
          e.currentTarget.style.background = 'rgba(240,235,224,0.5)';
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--ink)',
            letterSpacing: '0.05em',
            marginBottom: 4
          }}
        >
          {cap.n}
        </div>

        <div
          style={{
            fontFamily: 'Special Elite',
            fontSize: 9,
            color: 'var(--ink4)',
            lineHeight: 1.5
          }}
        >
          {cap.d}
        </div>

        {cap.n === 'AI Anomaly Detection' && (
          <div style={{ marginTop: 10 }}>
            <button
              className="btn btn-xs"
              onClick={(e) => {
                e.stopPropagation();
                runAnomalyDetection();
              }}
              disabled={anomalyLoading}
              style={{
                width: '100%',
                fontSize: 9,
                letterSpacing: '0.08em',
                opacity: anomalyLoading ? 0.7 : 1,
              }}
            >
              {anomalyLoading ? 'SCANNING...' : 'RUN SPIKE SCAN'}
            </button>

            {anomalyError && (
              <div
                style={{
                  marginTop: 8,
                  padding: '7px 8px',
                  border: '1px solid var(--red)',
                  background: 'var(--redx)',
                  color: 'var(--red)',
                  fontFamily: 'Special Elite',
                  fontSize: 8,
                  lineHeight: 1.5,
                }}
              >
                ⚠ {anomalyError}
              </div>
            )}

            {anomalyResult?.hasAnomaly ? (
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 9px',
                  border: '1px solid var(--red)',
                  background: 'var(--redx)',
                  fontFamily: 'Special Elite',
                  fontSize: 8,
                  lineHeight: 1.55,
                }}
              >
                <div style={{ color: 'var(--red)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 5 }}>
                  ⚠ CARBON SPIKE DETECTED
                </div>

                {anomalyResult.alerts.map((alert, idx) => (
                  <div key={idx} style={{ borderTop: idx ? '1px dashed var(--ink5)' : 'none', paddingTop: idx ? 6 : 0, marginTop: idx ? 6 : 0 }}>
                    <div>CO₂ VALUE: {alert.value}</div>
                    <div>SEVERITY: {String(alert.severity).toUpperCase()}</div>
                    <div>CONFIDENCE: {(alert.confidence * 100).toFixed(0)}%</div>
                    <div>REASON: {alert.reason}</div>
                  </div>
                ))}
              </div>
            ) : anomalyResult ? (
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 9px',
                  border: '1px solid var(--green)',
                  background: 'var(--greenx)',
                  color: 'var(--green)',
                  fontFamily: 'Special Elite',
                  fontSize: 8,
                  lineHeight: 1.5,
                }}
              >
                ✅ NO ABNORMAL EMISSION SPIKE DETECTED
              </div>
            ) : null}
          </div>
        )}
      </div>
    ))}
  </div>
</div>
      </div>
    </div>
  );
};

const HeatmapPortal = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/public/heatmap")
      .then((res) => res.json())
      .then((json) => setItems(json.data || []));
  }, []);

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ marginBottom: 20 }}>
        Public Heatmap Portal
      </h1>

      {items.map((item) => (
        <div
          key={item.industryId}
          style={{
            marginBottom: 16,
            padding: 18,
            border: "2px solid #333",
            background:
              item.color === "GREEN"
                ? "#d4f8d4"
                : item.color === "YELLOW"
                ? "#fff3bf"
                : "#ffd6d6",
          }}
        >
          <h2>{item.name}</h2>

          <p>Status: {item.status}</p>

          <p>
            Location: {item.city}, {item.state}
          </p>

          <p>
            Coordinates:
            {" "}
            {item.latitude},
            {" "}
            {item.longitude}
          </p>
        </div>
      ))}
    </div>
  );
};
 
// ── EMISSIONS ─────────────────────────────────────────────────────────────────
const Emissions = ({ user, emissions, setEmissions }) => {
  const [form, setForm] = useState({ co2: '', nox: '', sox: '', aqi: '', pm25: '', location: '', note: '' });
  const [status, setStatus] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
 
  const stOf = e => e.co2 > 270 || e.nox > 50 ? { s: 'Critical', bc: 'b-red' }
    : e.co2 > 240 || e.nox > 42 ? { s: 'Warning', bc: 'b-amber' } : { s: 'Compliant', bc: 'b-green' };
 
  const submit = () => {
    if (!form.co2 && !form.nox && !form.sox) { setStatus('error'); setTimeout(() => setStatus(null), 2500); return; }
    const entry = { id: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), co2: +form.co2 || 0, nox: +form.nox || 0, sox: +form.sox || 0, aqi: +form.aqi || 0, pm25: +form.pm25 || 0, location: form.location || 'Main Facility', note: form.note, by: user.name };
    const next = [entry, ...emissions]; setEmissions(next); S.set('emissions', next);
    setForm({ co2: '', nox: '', sox: '', aqi: '', pm25: '', location: '', note: '' });
    setStatus('ok'); setTimeout(() => setStatus(null), 2500);
  };
 
  const del = id => { const next = emissions.filter(e => e.id !== id); setEmissions(next); S.set('emissions', next); setConfirmDel(null); };
  const barData = [...emissions].reverse().slice(-8).map(e => ({ d: e.date?.slice(5) || '?', co2: e.co2, nox: e.nox }));
 
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, background: 'var(--paper)' }}>
      <div className="a0" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)', letterSpacing: '0.2em', marginBottom: 4 }}>DATA ENTRY MODULE · IoT SENSOR INTEGRATION</div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.12em' }}>EMISSION RECORDS</div>
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, marginBottom: 16 }}>
        {/* Form */}
        <div className="sketch-panel bracket a1" style={{ padding: '22px', height: 'fit-content' }}>
          <div className="stitle">Submit Reading</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[['co2', 'CO₂ t/mo', '248'], ['nox', 'NOₓ kg', '44'], ['sox', 'SOₓ kg', '11'], ['aqi', 'AQI Index', '84']].map(([k, l, p]) => (
              <div key={k}>
                <label className="lbl">{l}</label>
                <input className="inp" type="number" value={form[k]} onChange={set(k)} placeholder={p} style={{ height: 36, fontSize: 12 }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label className="lbl">PM2.5 µg/m³</label>
            <input className="inp" type="number" value={form.pm25} onChange={set('pm25')} placeholder="35" style={{ height: 36, fontSize: 12 }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label className="lbl">Facility / Location</label>
            <input className="inp" type="text" value={form.location} onChange={set('location')} placeholder="Main Facility" style={{ fontSize: 12 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Field Notes</label>
            <textarea className="inp" value={form.note} onChange={set('note')} placeholder="Optional observations…" style={{ minHeight: 56, fontSize: 12 }} />
          </div>
          {status === 'ok'    && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--green)', background: 'var(--greenx)', border: '1.5px solid var(--green)', padding: '7px 10px', marginBottom: 10, letterSpacing: '0.06em' }}>✓ RECORD STORED SUCCESSFULLY</div>}
          {status === 'error' && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--red)', background: 'var(--redx)', border: '1.5px solid var(--red)', padding: '7px 10px', marginBottom: 10, letterSpacing: '0.06em' }}>⚠ ENTER AT LEAST ONE VALUE</div>}
          <button className="btn btn-primary" onClick={submit} style={{ width: '100%', letterSpacing: '0.2em', fontSize: 12 }}>SUBMIT READING</button>
        </div>
 
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {emissions.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { l: 'AVERAGE CO₂', v: Math.round(emissions.reduce((a, e) => a + e.co2, 0) / emissions.length), u: 't/mo', c: 'var(--red)' },
                { l: 'AVERAGE NOₓ', v: Math.round(emissions.reduce((a, e) => a + e.nox, 0) / emissions.length), u: 'kg',   c: 'var(--green)' },
                { l: 'AVERAGE SOₓ', v: Math.round(emissions.reduce((a, e) => a + e.sox, 0) / emissions.length), u: 'kg',   c: 'var(--blue)' },
              ].map((s, i) => (
                <div key={i} className={`sketch-panel a${i+1}`} style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Special Elite', fontSize: 8, color: 'var(--ink4)', letterSpacing: '0.2em', marginBottom: 6 }}>{s.l}</div>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)' }}>{s.u}</div>
                </div>
              ))}
            </div>
          )}
          <div className="sketch-panel a2" style={{ padding: '18px 16px 14px', flex: 1 }}>
            <div className="stitle">Recent Readings</div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={barData} margin={{ left: -12, right: 8 }} barGap={3}>
                  <CartesianGrid stroke="rgba(26,20,16,0.07)" vertical={false} strokeDasharray="4 3" />
                  <XAxis dataKey="d" stroke="transparent" tick={{ fontSize: 10, fontFamily: 'Special Elite', fill: 'var(--ink4)' }} />
                  <YAxis stroke="transparent" tick={{ fontSize: 10, fontFamily: 'Special Elite', fill: 'var(--ink4)' }} />
                  <Tooltip content={<ChartTip />} />
                  <Legend iconSize={10} wrapperStyle={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)' }} />
                  <Bar dataKey="co2" name="CO₂" fill="rgba(192,57,43,0.75)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="nox" name="NOₓ" fill="rgba(30,132,73,0.75)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Special Elite', fontSize: 11, color: 'var(--ink4)', letterSpacing: '0.1em' }}>SUBMIT DATA TO SEE CHART</span></div>}
          </div>
        </div>
      </div>
 
      {/* Table */}
      <div className="sketch-panel a3" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="stitle" style={{ margin: 0 }}>Emission History<span style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', fontWeight: 400, marginLeft: 10 }}>// {emissions.length} RECORDS</span></div>
          {emissions.length > 0 && <button className="btn btn-sm btn-danger" onClick={() => { setEmissions([]); S.set('emissions', []); }}>CLEAR ALL</button>}
        </div>
        {emissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', fontFamily: 'Special Elite', fontSize: 11, color: 'var(--ink4)', letterSpacing: '0.15em' }}>— NO RECORDS — SUBMIT YOUR FIRST READING —</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Date/Time</th><th>Location</th><th>CO₂</th><th>NOₓ</th><th>SOₓ</th><th>AQI</th><th>Status</th><th>By</th><th></th></tr></thead>
              <tbody>
                {emissions.map((r, i) => {
                  const st = stOf(r);
                  return (
                    <tr key={r.id} style={{ animation: `slideR 0.3s ${i * 0.03}s ease both` }}>
                      <td style={{ fontFamily: 'var(--font-body)', fontSize: 11 }}>{r.date} <span style={{ color: 'var(--ink4)' }}>{r.time}</span></td>
                      <td style={{ fontSize: 12 }}>{r.location}</td>
                      <td><span style={{ fontFamily: 'var(--font-body)', color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>{r.co2}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-body)', color: 'var(--green)', fontSize: 13 }}>{r.nox}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-body)', color: 'var(--blue)', fontSize: 13 }}>{r.sox}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink3)' }}>{r.aqi || '—'}</span></td>
                      <td><span className={`badge ${st.bc}`}>{st.s}</span></td>
                      <td style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)' }}>{r.by}</td>
                      <td>
                        {confirmDel === r.id ? (
                          <span style={{ display: 'flex', gap: 5 }}>
                            <button className="btn btn-xs btn-danger" onClick={() => del(r.id)}>Confirm</button>
                            <button className="btn btn-xs" onClick={() => setConfirmDel(null)}>Cancel</button>
                          </span>
                        ) : <button className="btn btn-xs" onClick={() => setConfirmDel(r.id)} style={{ color: 'var(--ink4)', borderColor: 'transparent', boxShadow: 'none' }}>Delete</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
 
// ── COMPLIANCE ────────────────────────────────────────────────────────────────
const Compliance = ({ emissions }) => {
  const [facilities, setFacilities] = useState(() => S.get('facilities', [
    { id: 1, n: 'Facility Alpha', score: 92, sector: 'Industrial',    audit: '2024-05-15', violations: 0 },
    { id: 2, n: 'Facility Beta',  score: 78, sector: 'Chemical',      audit: '2024-05-18', violations: 2 },
    { id: 3, n: 'Facility Gamma', score: 45, sector: 'Power',         audit: '2024-05-20', violations: 5 },
    { id: 4, n: 'Facility Delta', score: 88, sector: 'Manufacturing', audit: '2024-05-14', violations: 0 },
  ]));
  const [adding, setAdding] = useState(false);
  const [nf, setNf] = useState({ n: '', score: 80, sector: 'Industrial' });
 
  const stOf = score => score >= 80 ? { s: 'Compliant', bc: 'b-green', c: 'var(--green)' }
    : score >= 60 ? { s: 'Warning', bc: 'b-amber', c: 'var(--amber)' }
    : { s: 'Critical', bc: 'b-red', c: 'var(--red)' };
 
  const addFac = () => {
    if (!nf.n) return;
    const sc = parseInt(nf.score);
    const entry = { id: Date.now(), n: nf.n, score: sc, sector: nf.sector, audit: new Date().toISOString().split('T')[0], violations: sc < 60 ? Math.floor((100 - sc) / 20) : 0 };
    const next = [...facilities, entry]; setFacilities(next); S.set('facilities', next);
    setNf({ n: '', score: 80, sector: 'Industrial' }); setAdding(false);
  };
  const delFac = id => { const next = facilities.filter(f => f.id !== id); setFacilities(next); S.set('facilities', next); };
  const lineData = [...emissions].reverse().slice(-8).map(e => ({ d: e.date?.slice(5) || '?', co2: e.co2, limit: 240 }));
 
  const notices = [
    { lvl: 'critical', title: 'NOTICE-001', msg: 'Facility Gamma violations — threshold exceeded by 47%. Regulatory action initiated.', c: 'var(--red)',   bg: 'var(--redx)' },
    { lvl: 'warning',  title: 'NOTICE-002', msg: 'Facility Beta emissions increasing. Corrective measures required within 14 days.',   c: 'var(--amber)', bg: 'var(--amberx)' },
    { lvl: 'info',     title: 'NOTICE-003', msg: 'Annual environmental audit scheduled Q3 2024. All facilities prepare documentation.', c: 'var(--blue)',  bg: 'var(--bluex)' },
  ];
 
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, background: 'var(--paper)' }}>
      <div className="a0" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)', letterSpacing: '0.2em', marginBottom: 4 }}>REGULATORY OVERSIGHT · CPCB/SPCB RULE ENGINE</div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.12em' }}>COMPLIANCE REGISTRY</div>
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: 12, marginBottom: 16 }}>
        {facilities.map((f, i) => {
          const st = stOf(f.score);
          return (
            <div key={f.id} className="sketch-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden', animation: `fadeUp .5s ${i * 0.07}s ease both`, borderTop: `4px solid ${st.c}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink)', fontWeight: 500 }}>{f.n}</div>
                  <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', marginTop: 1 }}>{f.sector}</div>
                </div>
                <button className="btn btn-xs" onClick={() => delFac(f.id)} style={{ color: 'var(--ink4)', borderColor: 'transparent', boxShadow: 'none', height: 20, padding: '0 6px' }}>✕</button>
              </div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 38, fontWeight: 700, color: st.c, lineHeight: 1, marginBottom: 8 }}>
                {f.score}<span style={{ fontSize: 14, color: 'var(--ink4)', fontWeight: 300 }}>%</span>
              </div>
              <div className="prog" style={{ marginBottom: 8 }}>
                <div className="prog-fill" style={{ width: `${f.score}%`, background: `repeating-linear-gradient(45deg, ${st.c} 0, ${st.c} 3px, transparent 3px, transparent 6px)` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${st.bc}`}>{st.s}</span>
                <span style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)' }}>{f.violations} viol.</span>
              </div>
            </div>
          );
        })}
 
        {/* Add */}
        {!adding ? (
          <div onClick={() => setAdding(true)} style={{ border: '2px dashed var(--ink4)', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s', minHeight: 160 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink3)'; e.currentTarget.style.background = 'rgba(26,20,16,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ink4)'; e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--ink4)' }}>+</div>
            <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', letterSpacing: '0.2em' }}>ADD FACILITY</div>
          </div>
        ) : (
          <div className="sketch-panel" style={{ padding: '16px' }}>
            <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', letterSpacing: '0.2em', marginBottom: 12 }}>NEW FACILITY</div>
            {[['n', 'Name', 'text', 'Facility X'], ['score', 'Score', 'number', '80']].map(([k, l, t, p]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <label className="lbl">{l}</label>
                <input className="inp" type={t} value={nf[k]} onChange={e => setNf(p => ({ ...p, [k]: e.target.value }))} placeholder={p} style={{ height: 32, fontSize: 12 }} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label className="lbl">Sector</label>
              <select className="inp" value={nf.sector} onChange={e => setNf(p => ({ ...p, sector: e.target.value }))} style={{ height: 32, fontSize: 12 }}>
                {['Industrial', 'Chemical', 'Power', 'Manufacturing', 'Mining'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-primary btn-sm" onClick={addFac} style={{ flex: 1, letterSpacing: '0.1em' }}>ADD</button>
              <button className="btn btn-sm" onClick={() => setAdding(false)}>CANCEL</button>
            </div>
          </div>
        )}
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="sketch-panel a3" style={{ padding: '18px' }}>
          <div className="stitle">Facility Register</div>
          <table className="tbl">
            <thead><tr><th>Facility</th><th>Score</th><th>Sector</th><th>Violations</th><th>Last Audit</th></tr></thead>
            <tbody>
              {facilities.map(r => {
                const st = stOf(r.score);
                return (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em' }}>{r.n}</td>
                    <td><span style={{ fontFamily: 'var(--font-title)', color: st.c, fontSize: 16, fontWeight: 700 }}>{r.score}%</span></td>
                    <td style={{ fontSize: 12, color: 'var(--ink3)' }}>{r.sector}</td>
                    <td><span style={{ fontFamily: 'var(--font-body)', color: r.violations > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700, fontSize: 12 }}>{r.violations}</span></td>
                    <td style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)' }}>{r.audit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
 
        <div className="sketch-panel a4" style={{ padding: '18px 16px 14px' }}>
          <div className="stitle">CO₂ vs Limit</div>
          {lineData.length > 1 ? (
            <ResponsiveContainer width="100%" height={175}>
              <LineChart data={lineData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="rgba(26,20,16,0.07)" vertical={false} strokeDasharray="4 3" />
                <XAxis dataKey="d" stroke="transparent" tick={{ fontSize: 10, fontFamily: 'Special Elite', fill: 'var(--ink4)' }} />
                <YAxis stroke="transparent" tick={{ fontSize: 10, fontFamily: 'Special Elite', fill: 'var(--ink4)' }} />
                <Tooltip content={<ChartTip />} />
                <Legend iconSize={10} wrapperStyle={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)' }} />
                <Line type="monotone" dataKey="co2" name="CO₂" stroke="#c0392b" strokeWidth={2.5} dot={{ r: 3, fill: '#c0392b' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="limit" name="Limit" stroke="#d35400" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 175, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Special Elite', fontSize: 11, color: 'var(--ink4)', letterSpacing: '0.1em' }}>SUBMIT DATA TO COMPARE</span></div>}
        </div>
      </div>
 
      <div className="sketch-panel a5" style={{ padding: '18px' }}>
        <div className="stitle">Regulatory Notices</div>
        {notices.map((n, i) => (
          <div key={i} style={{ padding: '12px 14px', background: n.bg, border: `2px solid ${n.c}`, marginBottom: 8, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span className={`badge ${n.lvl === 'critical' ? 'b-red' : n.lvl === 'warning' ? 'b-amber' : 'b-blue'}`} style={{ flexShrink: 0, marginTop: 1 }}>{n.lvl}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 10, color: n.c, letterSpacing: '0.2em', marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>{n.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
 
// ── REPORTS ───────────────────────────────────────────────────────────────────
const Reports = ({ user, emissions }) => {
  const initR = [
    { id: 1, name: 'Monthly Emissions — May 2024',   date: '2024-05-20', size: '2.4 MB', type: 'Monthly Emissions', records: 0 },
    { id: 2, name: 'Quarterly Compliance — Q2 2024', date: '2024-05-15', size: '5.8 MB', type: 'Quarterly Compliance', records: 0 },
  ];
  const [reports, setReports] = useState(() => S.get('reports', initR));
  const [rtype, setRtype] = useState('Monthly Emissions');
  const [period, setPeriod] = useState('Current Month');
  const [gen, setGen] = useState(false);
 
  const sizes = { 'Monthly Emissions': '2.4 MB', 'Quarterly Compliance': '5.8 MB', 'Annual Report': '12.3 MB', 'Facility Audit': '3.1 MB', 'AI Insights': '1.8 MB' };
 
  const generate = () => {
    if (gen) return; setGen(true);
    setTimeout(() => {
      const entry = { id: Date.now(), name: `${rtype} — ${period}`, date: new Date().toISOString().split('T')[0], size: sizes[rtype] || '2.0 MB', type: rtype, records: emissions.length };
      const next = [entry, ...reports]; setReports(next); S.set('reports', next);
      setGen(false);
    }, 2400);
  };
 
  const delR = id => { const next = reports.filter(r => r.id !== id); setReports(next); S.set('reports', next); };
 
  const monthBar = () => {
    const m = {};
    emissions.forEach(e => { const mo = e.date?.slice(0, 7) || '?'; if (!m[mo]) m[mo] = { mo: mo.slice(5), co2: 0, n: 0 }; m[mo].co2 += e.co2; m[mo].n++; });
    return Object.values(m).slice(-6).map(v => ({ mo: v.mo, avg: Math.round(v.co2 / v.n) }));
  };
 
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, background: 'var(--paper)' }}>
      <div className="a0" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink4)', letterSpacing: '0.2em', marginBottom: 4 }}>DOCUMENTATION MODULE · PDF NOTICE GENERATION</div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.12em' }}>REPORTS & DOCUMENTS</div>
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { l: 'TOTAL REPORTS', v: reports.length, c: 'var(--ink)' },
          { l: 'GENERATED TODAY', v: reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length, c: 'var(--blue)' },
          { l: 'DATA RECORDS', v: emissions.length, c: 'var(--green)' },
          { l: 'STORAGE USED', v: `${(reports.reduce((a, r) => a + (parseFloat(r.size) || 0), 0)).toFixed(1)} MB`, raw: true, c: 'var(--ink3)' },
        ].map((s, i) => (
          <div key={i} className={`sketch-panel a${i+1}`} style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Special Elite', fontSize: 8, color: 'var(--ink4)', letterSpacing: '0.2em', marginBottom: 6 }}>{s.l}</div>
            {s.raw ? <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 700, color: s.c }}>{s.v}</div>
              : <div style={{ fontFamily: 'var(--font-title)', fontSize: 30, fontWeight: 700, color: s.c }}><AnimNum to={s.v} /></div>}
          </div>
        ))}
      </div>
 
      {/* PDF notice progress bar — matches image */}
      <div className="sketch-panel a1" style={{ padding: '16px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.15em' }}>PDF NOTICE GENERATION SYSTEM</div>
          <div className="live"><span className="live-dot" />READY</div>
        </div>
        <div className="prog">
          <div className="prog-fill" style={{ width: '85%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)' }}>
          <span>AUTO COMPLIANCE NOTICE · AQI VERIFICATION · PUBLIC HEATMAP</span>
          <span>85%</span>
        </div>
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {monthBar().length > 0 && (
            <div className="sketch-panel a2" style={{ padding: '18px 16px 14px' }}>
              <div className="stitle">Monthly Average CO₂</div>
              <ResponsiveContainer width="100%" height={155}>
                <BarChart data={monthBar()} margin={{ left: -10, right: 8 }}>
                  <CartesianGrid stroke="rgba(26,20,16,0.07)" vertical={false} strokeDasharray="4 3" />
                  <XAxis dataKey="mo" stroke="transparent" tick={{ fontSize: 10, fontFamily: 'Special Elite', fill: 'var(--ink4)' }} />
                  <YAxis stroke="transparent" tick={{ fontSize: 10, fontFamily: 'Special Elite', fill: 'var(--ink4)' }} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="avg" name="Avg CO₂" fill="rgba(26,20,16,0.6)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
 
          <div className="sketch-panel a3" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="stitle" style={{ margin: 0 }}>Report Archive <span style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', fontWeight: 400, marginLeft: 10 }}>// {reports.length} FILES</span></div>
              {reports.length > 0 && <button className="btn btn-sm btn-danger" onClick={() => { setReports([]); S.set('reports', []); }}>CLEAR ALL</button>}
            </div>
            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', fontFamily: 'Special Elite', fontSize: 11, color: 'var(--ink4)', letterSpacing: '0.15em' }}>— NO REPORTS GENERATED YET —</div>
            ) : reports.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', border: '1px solid var(--ink5)', background: 'rgba(240,235,224,0.5)', marginBottom: 6, transition: 'all 0.15s', cursor: 'default', animation: `slideR 0.3s ${i * 0.04}s ease both` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink3)'; e.currentTarget.style.background = 'rgba(26,20,16,0.04)'; e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--ink5)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ink5)'; e.currentTarget.style.background = 'rgba(240,235,224,0.5)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: 28, height: 28, border: '2px solid var(--ink3)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Special Elite', fontSize: 12, color: 'var(--ink3)' }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div style={{ fontFamily: 'Special Elite', fontSize: 9, color: 'var(--ink4)', marginTop: 2 }}>{r.date} · {r.size}{r.records ? ` · ${r.records} records` : ''}</div>
                </div>
                <span className="badge b-green" style={{ flexShrink: 0 }}>READY</span>
                <button className="btn btn-xs" onClick={() => delR(r.id)} style={{ color: 'var(--ink4)', borderColor: 'transparent', boxShadow: 'none' }}>DEL</button>
              </div>
            ))}
          </div>
        </div>
 
        {/* Generator panel */}
        <div className="sketch-panel bracket a2" style={{ padding: '20px', height: 'fit-content' }}>
          <div className="stitle">Generate Report</div>
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">Report Type</label>
            <select className="inp" value={rtype} onChange={e => setRtype(e.target.value)} style={{ fontSize: 12 }}>
              {Object.keys(sizes).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Period</label>
            <select className="inp" value={period} onChange={e => setPeriod(e.target.value)} style={{ fontSize: 12 }}>
              {['Current Month', 'Last Month', 'Q2 2024', 'Q1 2024', 'Full Year 2024'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
 
          <div style={{ background: 'rgba(26,20,16,0.04)', border: '1px dashed var(--ink4)', padding: '12px', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Special Elite', fontSize: 8, color: 'var(--ink4)', letterSpacing: '0.2em', marginBottom: 8 }}>PREVIEW</div>
            {[
              { l: 'Data Records', v: emissions.length },
              { l: 'Date Range', v: emissions.length > 0 ? `${emissions[emissions.length-1]?.date} → ${emissions[0]?.date}` : 'No data' },
              { l: 'Format', v: 'PDF + CSV' },
              { l: 'Est. Size', v: sizes[rtype] },
            ].map((x, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: 'var(--ink4)' }}>{x.l}</span>
                <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{x.v}</span>
              </div>
            ))}
          </div>
 
          {gen && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'Special Elite', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.15em', marginBottom: 6 }}>GENERATING...</div>
              <div className="prog">
                <div className="prog-fill" style={{ width: '70%', background: 'repeating-linear-gradient(45deg, var(--amber) 0, var(--amber) 3px, transparent 3px, transparent 6px)', animation: 'typeIn 2.4s ease forwards' }} />
              </div>
            </div>
          )}
 
          <button className="btn btn-primary" onClick={generate} style={{ width: '100%', letterSpacing: '0.2em', fontSize: 12 }} disabled={gen}>
            {gen ? 'GENERATING REPORT...' : 'GENERATE REPORT'}
          </button>
 
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed var(--ink4)' }}>
            <div style={{ fontFamily: 'Special Elite', fontSize: 8, color: 'var(--ink4)', letterSpacing: '0.2em', marginBottom: 8 }}>ARCHIVE STATS</div>
            {[
              { l: 'Total storage', v: `${(reports.reduce((a, r) => a + (parseFloat(r.size) || 0), 0)).toFixed(1)} MB` },
              { l: 'Report types', v: [...new Set(reports.map(r => r.type))].length },
              { l: 'Oldest entry', v: reports.length > 0 ? reports[reports.length - 1]?.date : '—' },
            ].map((x, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, marginBottom: 6 }}>
                <span style={{ color: 'var(--ink4)' }}>{x.l}</span>
                <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{x.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
 
// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [emissions, setEmissions] = useState(() => S.get('emissions', []));
 
  if (!user) return <><style>{CSS}</style><Login onLogin={u => { setUser(u); setPage('dashboard'); }} /></>;
 
  return (
    <>
      <style>{CSS}</style>
      <div className="sketch-bg" />
      <div className="scanline" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', background: 'var(--paper)' }}>
        <Topbar user={user} page={page} setPage={setPage} onLogout={() => setUser(null)} emissions={emissions} />
        {page === 'dashboard'  && (<Dashboard  emissions={emissions} setPage={setPage}  />)}
        {page === 'emissions'  && <Emissions  user={user} emissions={emissions} setEmissions={setEmissions} />}
        {page === 'compliance' && <Compliance emissions={emissions} />}
        {page === 'reports'    && <Reports    user={user} emissions={emissions} />}
        {page === "heatmap" && (
  <HeatmapPortal />
)}
      </div>
    </>
  );
}