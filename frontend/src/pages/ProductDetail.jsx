import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api } from "../lib/api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setProduct(r.data));
    api.get("/colors").then((r) => setColors(r.data));
  }, [id]);

  if (!product) return <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24" data-testid="product-loading">Loading…</div>;

  const swatches = colors.filter((c) => product.swatch_color_ids?.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12" data-testid="product-detail">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-8" data-testid="back-to-products">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-7">
          <div className="aspect-[4/5] hairline overflow-hidden bg-white">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <div className="overline text-neutral-500 mb-3">{product.category} · {product.finish}</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight">{product.name}</h1>
          {product.price && <div className="mt-4 font-mono text-lg">₹{product.price} <span className="text-neutral-500 text-xs">/ starting</span></div>}
          <p className="mt-6 text-neutral-700 leading-relaxed">{product.description}</p>

          <div className="mt-10 grid grid-cols-2 gap-y-5 border-y py-6" style={{ borderColor: "var(--border)" }}>
            <Spec label="Coverage" value={product.coverage || "—"} />
            <Spec label="Finish" value={product.finish} />
            <Spec label="Category" value={product.category} />
            <Spec label="Featured" value={product.featured ? "Yes" : "No"} />
          </div>

          <div className="mt-8">
            <div className="overline text-neutral-500 mb-3">Pack sizes</div>
            <div className="flex flex-wrap gap-2">
              {product.pack_sizes?.length ? product.pack_sizes.map((ps) => (
                <span key={ps} className="px-3 py-1.5 text-xs uppercase tracking-widest border border-neutral-300" data-testid={`pack-${ps}`}>{ps}</span>
              )) : <span className="text-sm text-neutral-500">—</span>}
            </div>
          </div>

          {swatches.length > 0 && (
            <div className="mt-8">
              <div className="overline text-neutral-500 mb-3">Available in</div>
              <div className="grid grid-cols-4 gap-2">
                {swatches.map((c) => (
                  <div key={c.id} className="flex flex-col" data-testid={`swatch-${c.id}`}>
                    <div className="aspect-square" style={{ background: c.hex }} />
                    <div className="text-[10px] uppercase tracking-widest mt-1 font-mono">{c.code}</div>
                    <div className="text-xs">{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/contact" className="btn-solid mt-10" data-testid="product-detail-cta">Request quote <ArrowRight size={16} className="ml-2" /></Link>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <div className="overline text-neutral-500">{label}</div>
      <div className="mt-1 capitalize">{value}</div>
    </div>
  );
}
