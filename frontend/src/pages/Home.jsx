import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ShieldCheck, Award, Factory, Beaker, Calendar, Layers, Handshake } from "lucide-react";
import { api } from "../lib/api";

const LOGO = "https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/fb9btnfx_WhatsApp%20Image%202026-06-26%20at%203.49.15%20PM.jpeg";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    api.get("/products?featured=true").then((r) => setProducts(r.data));
    api.get("/colors").then((r) => setColors(r.data));
    api.get("/gallery").then((r) => setGallery(r.data.slice(0, 4)));
  }, []);

  // Pick a representative spread of bold shades for the strip
  const heroColors = colors.filter(c =>
    ["Polka","Sunrise","Signal Red","Electric Blue Plus","Mehendi-N","Noble Blue","Warm Gold","Royal Rose","Brazilian Forest"].includes(c.name)
  ).slice(0, 8);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="hero-section" style={{ background: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7 fade-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="overline" style={{ color: "var(--navy)" }}>Est. 1983</span>
              <span className="w-12 h-px bg-neutral-400" />
              <span className="overline text-neutral-500">Manufactured in India</span>
            </div>
            <h1 className="font-display text-[44px] sm:text-6xl lg:text-[80px] leading-[0.95] tracking-tight" style={{ color: "var(--ink)" }}>
              INDUSTRIAL<br />
              COATINGS.<br />
              <span style={{ color: "var(--navy)" }}>ENGINEERED</span> <span className="font-serif-italic text-[0.85em]">to endure.</span>
            </h1>
            <p className="mt-7 text-neutral-700 max-w-xl text-base lg:text-[17px] leading-relaxed">
              SM Paint Industries manufactures decorative and industrial coatings under two trusted brands —
              <span className="font-semibold"> Vespa</span> for everyday workhorse performance, and
              <span className="font-semibold"> Galleria</span> for premium, specification-grade finishes.
            </p>
            <div className="mt-9 flex items-center gap-4 flex-wrap">
              <Link to="/products" className="btn-solid" data-testid="hero-cta-products">View Catalogue <ArrowRight size={16} className="ml-2" /></Link>
              <a href="https://drive.google.com/file/d/1l96sYgM3wdMgGpdAs842_eAFRJDGB8xl/view" target="_blank" rel="noreferrer" className="btn-line" data-testid="hero-cta-colors">Open Shade Card</a>
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
              <Stat n="40+" label="Years in business" />
              <Stat n="3" label="Brand portfolio" />
              <Stat n="116" label="Curated shades" />
              <Stat n="17" label="Products" />
            </div>
          </div>

          <div className="lg:col-span-5 fade-up">
            <div className="relative aspect-square">
              {/* Family product photo cover */}
              <div className="absolute inset-0 overflow-hidden hairline" style={{ background: "var(--navy)" }}>
                <img src={LOGO} alt="SM Paint Industries — Vespa & Galleria range" className="w-full h-full object-cover" data-testid="hero-cover-image" />
              </div>
              {/* Floating chip */}
              <div className="absolute -bottom-5 -left-5 bg-white border border-neutral-200 px-5 py-4 shadow-sm">
                <div className="overline text-neutral-500 mb-1">Two brands</div>
                <div className="flex items-center gap-3">
                  <span className="line-pill vespa">Vespa</span>
                  <span className="line-pill galleria">Galleria</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] font-bold" style={{ background: "var(--paint-yellow)", color: "var(--navy)" }}>
                Since 1983
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / CREDIBILITY */}
      <section
        className="border-y bg-white"
        style={{ borderColor: "var(--border)" }}
        data-testid="trust-section"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <TrustPoint icon={Calendar} title="Since 1983" desc="Four decades of coatings expertise from Chandni Chowk, Delhi." />
            <TrustPoint icon={Factory} title="In-house manufacturing" desc="Formulated and produced at our own facility under strict quality control." />
            <TrustPoint icon={Layers} title="Decorative & industrial coatings" desc="Emulsions, enamels, primers, and specialty finishes for every surface." />
            <TrustPoint icon={Handshake} title="Trusted dealer/project supply" desc="Serving builders, contractors, dealers, and homeowners across India." />
          </div>
        </div>
      </section>

      {/* COLOR STRIP — DRIPS */}
      <section style={{ background: "var(--ink)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center gap-6 overflow-x-auto">
          <span className="overline text-white/60 whitespace-nowrap">Featured shades</span>
          <div className="flex items-stretch gap-3 flex-1">
            {heroColors.map((c) => (
              <div key={c.id} className="flex items-center gap-3 whitespace-nowrap">
                <span className="w-6 h-6 border border-white/30" style={{ background: c.hex }} />
                <span className="text-xs text-white/80">{c.name}</span>
              </div>
            ))}
          </div>
          <Link to="/colors" className="text-xs text-white/80 hover:text-white flex items-center gap-1 whitespace-nowrap">All shades <ArrowUpRight size={14} /></Link>
        </div>
      </section>

      {/* TWO BRANDS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24" data-testid="brands-section">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="overline text-neutral-500 mb-3">Brand Architecture</div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl" style={{ color: "var(--ink)" }}>
              Two brands, <span style={{ color: "var(--navy)" }}>one standard.</span>
            </h2>
          </div>
          <Link to="/brands" className="text-sm flex items-center gap-1 hover:gap-2 transition-all" data-testid="see-brands">Learn more <ArrowUpRight size={16} /></Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Vespa Card */}
          <Link to="/products?line=vespa" className="card-surface card-surface-brand group" data-testid="brand-card-vespa">
            <div className="aspect-[5/2] overflow-hidden" style={{ background: "#0A2E66" }}>
              <img src="https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/98kradn4_image.png" alt="Vespa Interior/Exterior Emulsion Paint" className="w-full h-full object-contain p-4" />
            </div>
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <span className="line-pill vespa">Standard line</span>
                <span className="font-mono text-xs text-neutral-500">01</span>
              </div>
              <div className="font-serif-italic text-lg text-neutral-500 mb-4">Reliable. Workhorse.</div>
              <p className="text-neutral-700 leading-relaxed mb-6 text-sm">
                Vespa delivers reliable, workhorse coatings for everyday industrial and decorative needs — trusted on construction sites, factories, and homes across India.
              </p>
              <div className="grid grid-cols-2 gap-y-3 text-sm border-t border-neutral-200 pt-5">
                <div><div className="overline text-neutral-500 mb-1">Range</div><div>8 products</div></div>
                <div><div className="overline text-neutral-500 mb-1">Best for</div><div>Daily use</div></div>
                <div><div className="overline text-neutral-500 mb-1">Coverage</div><div>12-15 m²/lt</div></div>
                <div><div className="overline text-neutral-500 mb-1">Pricing</div><div>Workhorse value</div></div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--navy)" }} data-testid="explore-vespa">
                Explore Vespa <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Galleria Card */}
          <Link to="/products?line=galleria" className="card-surface card-surface-brand card-surface-dark group" data-testid="brand-card-galleria">
            <div className="aspect-[5/2] overflow-hidden">
              <img src="https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/czd1adua_image.png" alt="Galleria Weatherproof" className="w-full h-full object-contain p-4" />
            </div>
            <div className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at top right, var(--paint-yellow), transparent 70%)" }} />
              <div className="flex items-start justify-between mb-4 relative">
                <span className="line-pill galleria !bg-white !text-[color:var(--navy)] !border-white">Premium line</span>
                <span className="font-mono text-xs text-white/60">02</span>
              </div>
              <div className="font-serif-italic text-lg text-white/70 mb-4">Premium. Weatherproof.</div>
              <p className="text-white/85 leading-relaxed mb-6 text-sm">
                Galleria is our premium line — engineered for superior coverage, weatherproof exteriors, and a refined finish. High-grade pigments and binders for specification-grade projects.
              </p>
              <div className="grid grid-cols-2 gap-y-3 text-sm border-t border-white/20 pt-5">
                <div><div className="overline text-white/50 mb-1">Range</div><div>6 products</div></div>
                <div><div className="overline text-white/50 mb-1">Best for</div><div>Specification</div></div>
                <div><div className="overline text-white/50 mb-1">Coverage</div><div>15-22 m²/lt</div></div>
                <div><div className="overline text-white/50 mb-1">Pigments</div><div>Fade-resistant</div></div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white" data-testid="explore-galleria">
                Explore Galleria <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ background: "#fff" }} data-testid="featured-products">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="overline text-neutral-500 mb-3">Bestsellers</div>
              <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "var(--ink)" }}>Featured products</h2>
            </div>
            <Link to="/products" className="text-sm flex items-center gap-1 hover:gap-2 transition-all" data-testid="see-all-products">See all <ArrowUpRight size={16} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {products.map((p) => (
              <Link to={`/products/${p.id}`} key={p.id} className="card-surface card-surface-brand group block" data-testid={`product-card-${p.id}`}>
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`line-pill ${p.line}`}>{p.line}</span>
                    <span className="overline text-neutral-400">{p.category}</span>
                  </div>
                  <div className="font-display text-2xl mb-2" style={{ color: "var(--ink)" }}>{p.name.replace(/^(Vespa|Galleria)\s/, "")}</div>
                  <div className="text-sm text-neutral-500 leading-relaxed line-clamp-2">{p.short_description}</div>
                  <div className="mt-5 pt-5 border-t border-neutral-200 flex items-center justify-between text-xs">
                    <span className="font-mono text-neutral-500">{p.coverage}</span>
                    <span className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "var(--navy)" }}>View specs <ArrowRight size={14} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid md:grid-cols-4 gap-8">
          <Feature icon={Factory} title="Made since 1983" desc="Four decades of in-house manufacturing from Chandni Chowk, Delhi." />
          <Feature icon={Beaker} title="Engineered formulas" desc="Continuously upgraded under rigorous quality control." />
          <Feature icon={ShieldCheck} title="Corrosion resistant" desc="Specification-grade primers and protective coatings." />
          <Feature icon={Award} title="DO IT RIGHT" desc="Our manufacturing creed — don't regret a single coat." />
        </div>
      </section>

      {/* GALLERY TEASER */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24" data-testid="gallery-teaser">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="overline text-neutral-500 mb-3">In Place</div>
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "var(--ink)" }}>Projects we{`'`}ve coated</h2>
          </div>
          <Link to="/gallery" className="text-sm flex items-center gap-1 hover:gap-2 transition-all" data-testid="see-gallery">Visit gallery <ArrowUpRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-6 gap-4 stagger">
          {gallery[0] && <Link to="/gallery" className="col-span-6 md:col-span-4 aspect-[16/10] overflow-hidden hairline"><img src={gallery[0].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></Link>}
          {gallery[1] && <Link to="/gallery" className="col-span-3 md:col-span-2 aspect-[4/5] overflow-hidden hairline"><img src={gallery[1].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></Link>}
          {gallery[2] && <Link to="/gallery" className="col-span-3 md:col-span-2 aspect-square overflow-hidden hairline"><img src={gallery[2].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></Link>}
          {gallery[3] && <Link to="/gallery" className="col-span-6 md:col-span-4 aspect-[16/9] overflow-hidden hairline"><img src={gallery[3].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></Link>}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--ink)", color: "#fff" }} data-testid="home-cta">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="overline mb-4" style={{ color: "var(--paint-yellow)" }}>Dealer & project enquiries</div>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight">Need volumes, custom shades, or a project quote?</h2>
            <p className="mt-5 text-white/70 max-w-xl leading-relaxed">Our sales team will assemble swatches, product picks, and a pricing estimate within 24 hours of your request.</p>
          </div>
          <div className="md:col-span-5 md:text-right">
            <Link to="/contact" className="btn-light" data-testid="home-cta-quote">Request a Quote <ArrowRight size={16} className="ml-2" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="font-display text-3xl lg:text-4xl" style={{ color: "var(--navy)" }}>{n}</div>
      <div className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="border-t border-neutral-300 pt-6">
      <Icon size={22} strokeWidth={1.5} style={{ color: "var(--navy)" }} />
      <div className="font-display text-lg mt-4">{title}</div>
      <div className="text-sm text-neutral-600 mt-2 leading-relaxed">{desc}</div>
    </div>
  );
}

function TrustPoint({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm" style={{ background: "rgba(10, 46, 102, 0.06)" }}>
        <Icon size={18} strokeWidth={1.5} style={{ color: "var(--navy)" }} />
      </div>
      <div>
        <div className="font-display text-base" style={{ color: "var(--ink)" }}>{title}</div>
        <div className="text-sm text-neutral-600 mt-1.5 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
