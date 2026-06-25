import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { api } from "../lib/api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    api.get("/products?featured=true").then((r) => setProducts(r.data.slice(0, 4))).catch(() => {});
    api.get("/colors").then((r) => setColors(r.data.slice(0, 12))).catch(() => {});
    api.get("/gallery").then((r) => setGallery(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7 fade-up">
            <div className="overline text-neutral-500 mb-6">Est. 2018 — Manufacturer of architectural finishes</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
              Color, considered.<br />
              <span className="italic text-neutral-500">Made by hand.</span>
            </h1>
            <p className="mt-8 text-neutral-600 max-w-xl text-base leading-relaxed">
              Chroma Paints crafts low-VOC emulsions, weather-resilient exteriors, and a deeply
              edited color library — designed for residential, commercial, and heritage projects
              across India.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link to="/products" className="btn-solid" data-testid="hero-cta-products">Explore Products <ArrowRight size={16} className="ml-2" /></Link>
              <Link to="/colors" className="btn-line" data-testid="hero-cta-colors">Browse Colors</Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] relative overflow-hidden" style={{ background: "#EDE6D6" }}>
              <img
                src="https://images.unsplash.com/photo-1759774313632-854207c22ec1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxsdXh1cmlvdXMlMjBsaXZpbmclMjByb29tJTIwcGFpbnRlZCUyMHdhbGwlMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwwfHx8fDE3ODIzNzQ2NTB8MA&ixlib=rb-4.1.0&q=85"
                alt="Painted interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="text-white font-mono text-xs uppercase tracking-[0.22em] drop-shadow">CP-G01 · Sage</div>
                <div className="w-12 h-12" style={{ background: "#8C9986", border: "2px solid white" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE / STRIP */}
      <section className="border-y" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-wrap items-center justify-between gap-6 text-xs uppercase tracking-[0.22em] text-neutral-500">
          <span>Low VOC</span><span>·</span>
          <span>BIS Certified</span><span>·</span>
          <span>Anti-algal Technology</span><span>·</span>
          <span>20+ Color Families</span><span>·</span>
          <span>Made in India</span>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24" data-testid="featured-products">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="overline text-neutral-500 mb-3">The Catalogue</div>
            <h2 className="font-display text-4xl sm:text-5xl">Featured finishes</h2>
          </div>
          <Link to="/products" className="text-sm flex items-center gap-1 hover:gap-2 transition-all" data-testid="see-all-products">
            See all <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
          {products.length === 0 && [0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-100" />
          ))}
          {products.map((p) => (
            <Link to={`/products/${p.id}`} key={p.id} className="group block" data-testid={`product-card-${p.id}`}>
              <div className="aspect-[3/4] overflow-hidden hairline bg-white">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="pt-4">
                <div className="overline text-neutral-500">{p.category}</div>
                <div className="font-display text-xl mt-1">{p.name}</div>
                <div className="text-sm text-neutral-500 mt-1 capitalize">{p.finish} finish</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COLOR LIBRARY TEASER */}
      <section className="py-24" style={{ background: "#1A1A1A", color: "#F9F8F6" }} data-testid="color-teaser">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="overline text-neutral-400 mb-3">The Color Library</div>
            <h2 className="font-display text-4xl sm:text-5xl mb-6">A palette curated, not stocked.</h2>
            <p className="text-neutral-400 leading-relaxed mb-8">
              Over 200 shades organised across earth, neutrals, greens, blues, and warms.
              Each shade is hand-mixed at our facility and shipped from a single batch for
              perfect tonal consistency.
            </p>
            <Link to="/colors" className="inline-flex items-center gap-2 text-sm border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors" data-testid="see-all-colors">
              Open the library <ArrowRight size={16} />
            </Link>
          </div>
          <div className="lg:col-span-8 grid grid-cols-4 gap-3 stagger">
            {colors.map((c) => (
              <div key={c.id} className="aspect-square flex flex-col justify-end p-3" style={{ background: c.hex }}>
                <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: isLight(c.hex) ? "#1A1A1A" : "#F9F8F6" }}>{c.code}</div>
                <div className="text-sm" style={{ color: isLight(c.hex) ? "#1A1A1A" : "#F9F8F6" }}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY TEASER */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24" data-testid="gallery-teaser">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="overline text-neutral-500 mb-3">In Place</div>
            <h2 className="font-display text-4xl sm:text-5xl">Projects & inspiration</h2>
          </div>
          <Link to="/gallery" className="text-sm flex items-center gap-1 hover:gap-2 transition-all" data-testid="see-gallery">
            Visit gallery <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-6 gap-4 stagger">
          {gallery[0] && <Link to="/gallery" className="col-span-6 md:col-span-4 aspect-[16/10] overflow-hidden hairline"><img src={gallery[0].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></Link>}
          {gallery[1] && <Link to="/gallery" className="col-span-3 md:col-span-2 aspect-[4/5] overflow-hidden hairline"><img src={gallery[1].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></Link>}
          {gallery[2] && <Link to="/gallery" className="col-span-3 md:col-span-2 aspect-square overflow-hidden hairline"><img src={gallery[2].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></Link>}
          {gallery[3] && <Link to="/gallery" className="col-span-6 md:col-span-4 aspect-[16/9] overflow-hidden hairline"><img src={gallery[3].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></Link>}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-t" style={{ borderColor: "var(--border)" }} data-testid="home-cta">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <h2 className="font-display text-4xl sm:text-5xl leading-tight">
              Considering Chroma for your project?
            </h2>
            <p className="mt-4 text-neutral-600 max-w-xl">
              Share your space, timeline, and finish preferences. Our team will assemble swatches,
              product picks, and a pricing estimate within 24 hours.
            </p>
          </div>
          <div className="md:col-span-5 md:text-right">
            <Link to="/contact" className="btn-solid" data-testid="home-cta-quote">Request a Quote <ArrowRight size={16} className="ml-2" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function isLight(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 165;
}
