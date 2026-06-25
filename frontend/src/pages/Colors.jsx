import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

function isLight(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 165;
}

export default function Colors() {
  const [colors, setColors] = useState([]);
  const [family, setFamily] = useState("All");

  useEffect(() => { api.get("/colors").then((r) => setColors(r.data)); }, []);

  const families = useMemo(() => ["All", ...Array.from(new Set(colors.map((c) => c.family)))], [colors]);
  const grouped = useMemo(() => {
    const filtered = family === "All" ? colors : colors.filter((c) => c.family === family);
    const g = {};
    for (const c of filtered) { (g[c.family] ||= []).push(c); }
    return g;
  }, [colors, family]);

  return (
    <div data-testid="colors-page">
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-10">
        <div className="overline text-neutral-500 mb-3">The Color Library</div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Every shade, hand-mixed.</h1>
        <p className="mt-4 text-neutral-600 max-w-2xl">Curated families and editorial pairings. Tap any swatch to view its code, name, and tonal context.</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-6 border-y" style={{ borderColor: "var(--border)" }} data-testid="color-family-bar">
        <div className="flex flex-wrap items-center gap-3">
          <span className="overline text-neutral-500 mr-2">Family</span>
          {families.map((f) => (
            <button
              key={f}
              onClick={() => setFamily(f)}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-colors ${family === f ? "bg-black text-white border-black" : "border-neutral-300 hover:border-black"}`}
              data-testid={`color-family-${f.toLowerCase()}`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-16">
        {Object.keys(grouped).map((fam) => (
          <div key={fam} data-testid={`color-group-${fam.toLowerCase()}`}>
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-display text-3xl">{fam}</h2>
              <span className="font-mono text-xs text-neutral-500">{grouped[fam].length} shades</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
              {grouped[fam].map((c) => (
                <div key={c.id} className="group aspect-[4/5] relative overflow-hidden transition-transform hover:-translate-y-1" style={{ background: c.hex }} data-testid={`color-card-${c.id}`}>
                  <div className="absolute inset-0 p-5 flex flex-col justify-between" style={{ color: isLight(c.hex) ? "#1A1A1A" : "#F9F8F6" }}>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">{c.code}</div>
                    <div>
                      <div className="font-display text-2xl leading-tight">{c.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] mt-1 opacity-70">{c.hex}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {colors.length === 0 && <div className="text-center text-neutral-500 py-12" data-testid="colors-empty">No colors yet.</div>}
      </section>
    </div>
  );
}
