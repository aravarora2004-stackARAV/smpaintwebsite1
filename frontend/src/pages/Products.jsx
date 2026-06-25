import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

const CATEGORIES = ["all", "interior", "exterior", "primer", "enamel", "distemper"];
const FINISHES = ["all", "matte", "satin", "gloss", "eggshell", "textured"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [finish, setFinish] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/products").then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) =>
      (category === "all" || p.category === category) &&
      (finish === "all" || p.finish === finish)
    );
  }, [products, category, finish]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16" data-testid="products-page">
      <div className="mb-12 fade-up">
        <div className="overline text-neutral-500 mb-3">The Catalogue</div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">All products</h1>
        <p className="mt-4 text-neutral-600 max-w-xl">A complete catalogue of our manufactured paints, primers, and finishes.</p>
      </div>

      <div className="flex flex-wrap items-center gap-8 py-6 border-y mb-12" style={{ borderColor: "var(--border)" }}>
        <FilterRow label="Category" value={category} options={CATEGORIES} onChange={setCategory} testid="filter-category" />
        <FilterRow label="Finish" value={finish} options={FINISHES} onChange={setFinish} testid="filter-finish" />
        <div className="ml-auto text-xs text-neutral-500 font-mono">{filtered.length} items</div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0,1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-neutral-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-neutral-500" data-testid="no-products">No products match those filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 stagger">
          {filtered.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="group block" data-testid={`product-card-${p.id}`}>
              <div className="aspect-[3/4] overflow-hidden hairline bg-white relative">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {p.featured && <div className="absolute top-3 left-3 px-2 py-1 text-[10px] uppercase tracking-widest bg-black text-white">Featured</div>}
              </div>
              <div className="pt-5 flex items-start justify-between gap-4">
                <div>
                  <div className="overline text-neutral-500">{p.category} · {p.finish}</div>
                  <div className="font-display text-2xl mt-1">{p.name}</div>
                </div>
                {p.price && <div className="font-mono text-sm whitespace-nowrap">₹{p.price}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, value, options, onChange, testid }) {
  return (
    <div className="flex items-center gap-3 flex-wrap" data-testid={testid}>
      <span className="overline text-neutral-500">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-colors ${value === o ? "bg-black text-white border-black" : "border-neutral-300 hover:border-black"}`}
          data-testid={`${testid}-${o}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
