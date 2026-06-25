import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { api } from "../lib/api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => { api.get(`/products/${id}`).then((r) => setProduct(r.data)); }, [id]);

  if (!product) return <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24" data-testid="product-loading">Loading…</div>;

  return (
    <div data-testid="product-detail">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-8" data-testid="back-to-products">
          <ArrowLeft size={16} /> Back to products
        </Link>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="aspect-[4/3] hairline overflow-hidden bg-white">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="mt-10">
                <div className="overline text-neutral-500 mb-5">Key features</div>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                      <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--navy)" }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-3 mb-4">
              <span className={`line-pill ${product.line}`}>{product.line}</span>
              <span className="overline text-neutral-400">{product.category}</span>
              {product.featured && <span className="overline" style={{ color: "var(--navy)" }}>Featured</span>}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.05]" style={{ color: "var(--ink)" }}>{product.name}</h1>
            {product.short_description && <div className="mt-3 text-neutral-600 leading-relaxed">{product.short_description}</div>}
            {product.price && <div className="mt-4 font-mono text-lg">₹{product.price} <span className="text-neutral-500 text-xs">/ starting</span></div>}

            {product.description && <p className="mt-7 text-neutral-700 leading-relaxed text-sm">{product.description}</p>}

            <div className="mt-10">
              <div className="overline text-neutral-500 mb-4">Technical data</div>
              <dl className="border-y" style={{ borderColor: "var(--border)" }}>
                <Spec label="Finish" value={product.finish} />
                <Spec label="Coverage" value={product.coverage_detail || product.coverage} mono />
                <Spec label="Drying time" value={product.drying_time} />
                <Spec label="Recoat / hard dry" value={product.recoat_time} />
                <Spec label="Application" value={product.application} />
                <Spec label="Thinner" value={product.thinner} />
                <Spec label="Recommended primer" value={product.recommended_primer} />
                <Spec label="Available shades" value={product.available_shades} />
              </dl>
            </div>

            <div className="mt-8">
              <div className="overline text-neutral-500 mb-3">Pack sizes</div>
              <div className="flex flex-wrap gap-2">
                {product.pack_sizes?.length ? product.pack_sizes.map((ps) => (
                  <span key={ps} className="px-3 py-1.5 text-xs uppercase tracking-widest font-semibold border border-neutral-300" data-testid={`pack-${ps.replace(/\s/g,'')}`}>{ps}</span>
                )) : <span className="text-sm text-neutral-500">—</span>}
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="btn-solid flex-1" data-testid="product-detail-cta">Request quote <ArrowRight size={16} className="ml-2" /></Link>
              <a href="https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/rn4b1406_SM%20PAINT%20SHADE%20CARD%20FINAL.pdf" target="_blank" rel="noreferrer" className="btn-line" data-testid="product-detail-shades">View shade card</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-12 gap-4 py-3.5 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
      <dt className="col-span-5 text-xs uppercase tracking-widest text-neutral-500">{label}</dt>
      <dd className={`col-span-7 text-sm ${mono ? "font-mono" : ""}`} style={{ color: "var(--ink)" }}>{value}</dd>
    </div>
  );
}
