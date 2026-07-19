import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { localProducts } from "../data/products";

const LINES = ["all", "vespa", "galleria", "general"];
const CATEGORIES = ["all", "emulsion", "enamel", "primer", "distemper", "varnish", "industrial", "specialty", "waterproofing"];

export default function Products() {
  const products = localProducts;
  const [params, setParams] = useSearchParams();
  const line = params.get("line") || "all";
  const category = params.get("category") || "all";
  const loading = false;

 

  const filtered = useMemo(() => {
    return products.filter((p) =>
      (line === "all" || p.line === line) &&
      (category === "all" || p.category === category)
    );
  }, [products, line, category]);

  const setFilter = (k, v) => {
    const np = new URLSearchParams(params);
    if (v === "all") np.delete(k); else np.set(k, v);
    setParams(np, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16" data-testid="products-page">
      <div className="mb-12 fade-up">
        <div className="overline text-neutral-500 mb-3">The catalogue</div>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight" style={{ color: "var(--ink)" }}>All products</h1>
        <p className="mt-5 text-neutral-600 max-w-2xl">Decorative and industrial coatings across our Vespa and Galleria lines — full technical data sheets included.</p>
      </div>

      <div className="space-y-4 py-6 border-y mb-12" style={{ borderColor: "var(--border)" }}>
        <FilterRow label="Line" value={line} options={LINES} onChange={(v) => setFilter("line", v)} testid="filter-line" pill />
        <FilterRow label="Category" value={category} options={CATEGORIES} onChange={(v) => setFilter("category", v)} testid="filter-category" />
        <div className="text-xs text-neutral-500 font-mono">{filtered.length} of {products.length} products</div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0,1,2,3,4,5].map(i => <div key={i} className="aspect-[4/3] bg-neutral-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-neutral-500" data-testid="no-products">No products match those filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {filtered.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="card-surface card-surface-brand group block" data-testid={`product-card-${p.id}`}>
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100 relative">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {p.featured && <div className="absolute top-3 right-3 px-2 py-1 text-[10px] uppercase tracking-widest font-bold" style={{ background: "var(--paint-yellow)", color: "var(--navy)" }}>Featured</div>}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`line-pill ${p.line}`}>{p.line}</span>
                  <span className="overline text-neutral-400">{p.category}</span>
                </div>
                <div className="font-display text-2xl leading-tight" style={{ color: "var(--ink)" }}>{p.name.replace(/^(Vespa|Galleria)\s/, "")}</div>
                <div className="text-sm text-neutral-500 mt-2 leading-relaxed line-clamp-2">{p.short_description}</div>
                <div className="mt-5 pt-5 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-neutral-500">{p.coverage}</span>
                  <span className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "var(--navy)" }}>Specs <ArrowRight size={14} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, value, options, onChange, testid, pill }) {
  return (
    <div className="flex items-center gap-3 flex-wrap" data-testid={testid}>
      <span className="overline text-neutral-500 w-20">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-colors font-semibold ${value === o ? "text-white border-transparent" : "border-neutral-300 hover:border-black text-neutral-700"} ${pill ? "" : ""}`}
          style={value === o ? { background: "var(--navy)" } : {}}
          data-testid={`${testid}-${o}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
