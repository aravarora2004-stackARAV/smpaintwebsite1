import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

function isLight(hex) {
  const c = (hex || "#000").replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 165;
}

const COLLECTIONS_ORDER = [
  "Whites, Beiges, Browns & Greys",
  "Yellows, Peaches, Oranges, Reds & Pinks",
  "Blues, Greens & Violets",
  "Interior Combinations",
];

export default function Colors() {
  const [colors, setColors] = useState([]);
  const [collection, setCollection] = useState("All");
  const [family, setFamily] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => { api.get("/colors").then((r) => setColors(r.data)); }, []);

  const collections = useMemo(() => {
    const inOrder = COLLECTIONS_ORDER.filter(c => colors.some(x => x.collection === c));
    return ["All", ...inOrder];
  }, [colors]);

  const families = useMemo(() => {
    const fams = Array.from(new Set(colors.filter(c => collection === "All" || c.collection === collection).map(c => c.family)));
    return ["All", ...fams.sort()];
  }, [colors, collection]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return colors.filter((c) =>
      (collection === "All" || c.collection === collection) &&
      (family === "All" || c.family === family) &&
      (!q || c.name.toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q))
    );
  }, [colors, collection, family, search]);

  // Group filtered by collection then family for display when "All" collections selected
  const grouped = useMemo(() => {
    const g = {};
    for (const c of filtered) {
      (g[c.collection] ||= []).push(c);
    }
    return g;
  }, [filtered]);

  return (
    <div data-testid="colors-page">
      {/* Hero */}
      <section className="relative" style={{ background: "var(--navy)", color: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="overline mb-4" style={{ color: "var(--paint-yellow)" }}>The shade card</div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-3xl leading-[1.02]">
            116 shades. <span className="font-serif-italic text-white/70">Four collections.</span>
          </h1>
          <p className="mt-6 text-white/70 max-w-2xl">From subtle whites to electric blues — every shade in our shade card, organised by collection. Available across Vespa Super Synthetic Enamel, Vespa Oil Bound Distemper, and Galleria Premium Enamel.</p>
        </div>
        <div className="paint-strip" />
      </section>

      {/* Filters */}
      <section className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 space-y-4" data-testid="color-filters">
          <div className="flex items-center gap-3 flex-wrap" data-testid="collection-bar">
            <span className="overline text-neutral-500 w-24">Collection</span>
            {collections.map((c) => (
              <button
                key={c}
                onClick={() => { setCollection(c); setFamily("All"); }}
                className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-colors font-semibold ${collection === c ? "text-white border-transparent" : "border-neutral-300 hover:border-black text-neutral-700"}`}
                style={collection === c ? { background: "var(--navy)" } : {}}
                data-testid={`collection-${c.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`}
              >
                {c === "All" ? "All collections" : shortLabel(c)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap" data-testid="family-bar">
            <span className="overline text-neutral-500 w-24">Family</span>
            {families.map((f) => (
              <button key={f} onClick={() => setFamily(f)}
                className={`text-xs uppercase tracking-widest px-3 py-1 border transition-colors ${family === f ? "bg-black text-white border-black" : "border-neutral-300 hover:border-black text-neutral-700"}`}
                data-testid={`family-${f.toLowerCase()}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="overline text-neutral-500 w-24">Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="By name or code…"
              className="flex-1 max-w-md border-b border-neutral-300 bg-transparent px-1 py-2 outline-none focus:border-black text-sm"
              data-testid="color-search"
            />
            <span className="font-mono text-xs text-neutral-500 ml-auto">{filtered.length} shades</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-20">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center text-neutral-500 py-12" data-testid="colors-empty">No shades match those filters.</div>
        )}
        {COLLECTIONS_ORDER.filter(c => grouped[c]).map((coll) => (
          <div key={coll} data-testid={`group-${coll.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`}>
            <div className="flex items-end justify-between mb-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="overline text-neutral-500 mb-1">Collection</div>
                <h2 className="font-display text-2xl sm:text-3xl">{coll}</h2>
              </div>
              <span className="font-mono text-xs text-neutral-500">{grouped[coll].length} shades</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
              {grouped[coll].map((c) => (
                <div key={c.id} className="group relative overflow-hidden transition-transform hover:-translate-y-1" data-testid={`color-card-${c.id}`}>
                  <div className="aspect-[4/5] relative" style={{ background: c.hex }}>
                    <div className="absolute inset-0 p-3 flex flex-col justify-between" style={{ color: isLight(c.hex) ? "#0B1220" : "#fff" }}>
                      <div className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-80">{c.code}</div>
                      <div>
                        <div className="font-display text-base leading-tight">{c.name}</div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-70 mt-0.5">{c.hex}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-2 border-x border-b border-neutral-200 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500">{c.family}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function shortLabel(c) {
  if (c.startsWith("Whites")) return "Whites & Neutrals";
  if (c.startsWith("Yellows")) return "Warm & Reds";
  if (c.startsWith("Blues")) return "Cool & Greens";
  if (c.startsWith("Interior")) return "Combinations";
  return c;
}
