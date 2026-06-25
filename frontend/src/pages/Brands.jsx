import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/iu3nu4xy_sm%20paints%20final%20logo%20more.png";

export default function Brands() {
  return (
    <div data-testid="brands-page">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="overline text-neutral-500 mb-3">Brand architecture</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.98]" style={{ color: "var(--ink)" }}>
              Two brands.<br />
              <span style={{ color: "var(--navy)" }}>One standard</span> <span className="font-serif-italic text-[0.85em] text-neutral-500">of excellence.</span>
            </h1>
            <p className="mt-6 text-neutral-700 max-w-2xl leading-relaxed">
              Both lines are manufactured at SM Paint Industries{`'`} facility, share the same commitment to quality, and have been backed by the same family of paint makers since 1983. They differ only in the grade of pigments, binders, and the audience they serve. We also manufacture sister-brand industrial paints under <span className="font-semibold">Batra, Bawa, Silver Coin</span> and <span className="font-semibold">Gold Coin</span>.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-square flex items-center justify-center" style={{ background: "var(--navy)" }}>
              <img src={LOGO} alt="SM Paint Industries" className="w-3/4 h-3/4 object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* COMPARE TABLE */}
      <section className="bg-white border-y" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="overline text-neutral-500 mb-4 text-center">At a glance</div>
          <h2 className="font-display text-3xl sm:text-4xl text-center mb-12" style={{ color: "var(--ink)" }}>Vespa vs Galleria</h2>

          <div className="grid grid-cols-3 border border-neutral-200">
            <div className="p-6 border-r border-neutral-200" />
            <div className="p-6 text-center border-r border-neutral-200">
              <div className="font-display text-2xl" style={{ color: "var(--ink)" }}>VESPA</div>
              <div className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Standard</div>
            </div>
            <div className="p-6 text-center" style={{ background: "var(--navy)", color: "#fff" }}>
              <div className="font-display text-2xl">GALLERIA</div>
              <div className="text-xs text-white/70 uppercase tracking-widest mt-1">Premium</div>
            </div>

            {ROWS.map((row, i) => (
              <CompareRow key={i} {...row} odd={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* VESPA SECTION */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20" data-testid="brand-vespa">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="aspect-square mb-8" style={{ background: "#0A2E66" }}>
              <img src="https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/98kradn4_image.png" alt="Vespa" className="w-full h-full object-contain p-10" />
            </div>
            <span className="line-pill vespa">Standard line</span>
            <div className="font-serif-italic text-xl text-neutral-500 mt-5 mb-6">Interior / Exterior Emulsion Paint.</div>
            <p className="text-neutral-700 leading-relaxed mb-8">
              Built for everyday industrial and decorative needs. Vespa is the line you{`'`}ll find on factory shutters, school walls, garden gates, and middle-class homes from Punjab to Tamil Nadu — because it does the job, predictably, every time.
            </p>
            <Link to="/products?line=vespa" className="btn-line">Explore Vespa products <ArrowRight size={16} className="ml-2" /></Link>
          </div>
          <div className="lg:col-span-7 space-y-3">
            <BrandRow name="Interior/Exterior Emulsion" desc="Versatile water-based wall emulsion" />
            <BrandRow name="Weatherproof Exterior Emulsion" desc="All-weather protection for façades" />
            <BrandRow name="Super Synthetic Enamel" desc="High-gloss multi-purpose enamel" />
            <BrandRow name="Red Oxide Primer" desc="Anti-corrosive metal primer" />
            <BrandRow name="White Primer" desc="Wood & wall primer with filler" />
            <BrandRow name="Blackboard Paint" desc="Chalk-receptive matt finish" />
            <BrandRow name="Oil Bound Distemper" desc="Washable interior distemper" />
            <BrandRow name="Synthetic Iron Oxide" desc="High-purity industrial pigment" />
            <BrandRow name="Synthetic Clear Varnish" desc="Crystal-clear protective varnish" />
            <BrandRow name="Hammertone Paint" desc="Decorative hammered metal finish" />
          </div>
        </div>
      </section>

      {/* GALLERIA SECTION */}
      <section style={{ background: "var(--ink)", color: "#fff" }} data-testid="brand-galleria">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="aspect-square mb-8" style={{ background: "#0A2E66" }}>
              <img src="https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/czd1adua_image.png" alt="Galleria" className="w-full h-full object-contain p-10" />
            </div>
            <span className="line-pill galleria !bg-white !text-[color:var(--navy)] !border-white">Premium line</span>
            <div className="font-serif-italic text-xl text-white/70 mt-5 mb-6">Weatherproof. Premium grade.</div>
            <p className="text-white/80 leading-relaxed mb-8">
              For specification jobs, designer interiors, and showpiece exteriors. Galleria uses high-grade alkyd resins, fade-resistant pigments, and a superior binder system — delivering up to <span className="text-white font-semibold">double the coverage</span> of standard paints with a mirror-like, hardwearing finish.
            </p>
            <Link to="/products?line=galleria" className="btn-light">Explore Galleria products <ArrowRight size={16} className="ml-2" /></Link>
          </div>
          <div className="lg:col-span-7 space-y-3">
            <BrandRow dark name="Premium Synthetic Enamel" desc="Mirror-like, fade-resistant" />
            <BrandRow dark name="Premium White Primer" desc="Double-coverage white primer" />
            <BrandRow dark name="Premium Red Oxide Primer" desc="Specification-grade metal primer" />
            <BrandRow dark name="Premium Blackboard Paint" desc="Deep matt with ultra-smooth chalk hold" />
            <BrandRow dark name="Synthetic Clear Varnish" desc="Premium UV-stable clear film" />
            <BrandRow dark name="Hammertone Paint" desc="Premium decorative hammer texture" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 text-center">
        <h2 className="font-display text-3xl sm:text-4xl mb-4" style={{ color: "var(--ink)" }}>Not sure which line is right?</h2>
        <p className="text-neutral-600 max-w-xl mx-auto mb-8">Tell us about your project and we{`'`}ll recommend the right line, products, and shades within 24 hours.</p>
        <Link to="/contact" className="btn-solid">Talk to our team <ArrowRight size={16} className="ml-2" /></Link>
      </section>
    </div>
  );
}

const ROWS = [
  { label: "Positioning", vespa: "Workhorse coatings", galleria: "Premium / specification grade" },
  { label: "Coverage (Enamel)", vespa: "12-15 m²/lt", galleria: "15-22 m²/lt" },
  { label: "Coverage (Primer)", vespa: "8-10 m²/lt / 2 coats", galleria: "16-20 m²/lt / 2 coats" },
  { label: "Pigments", vespa: "Standard", galleria: "High-opacity, fade-resistant" },
  { label: "Binder system", vespa: "Synthetic resin", galleria: "High-grade alkyd resin" },
  { label: "Weatherproof exterior emulsion", vespa: <Check size={16} className="mx-auto" />, galleria: <X size={16} className="mx-auto opacity-40" /> },
  { label: "Hammertone finish", vespa: <Check size={16} className="mx-auto" />, galleria: <Check size={16} className="mx-auto" /> },
  { label: "Clear varnish", vespa: <Check size={16} className="mx-auto" />, galleria: <Check size={16} className="mx-auto" /> },
  { label: "Distemper option", vespa: <Check size={16} className="mx-auto" />, galleria: <X size={16} className="mx-auto opacity-40" /> },
];

function CompareRow({ label, vespa, galleria, odd }) {
  const bg = odd ? "bg-neutral-50" : "";
  return (
    <>
      <div className={`p-4 border-t border-r border-neutral-200 text-xs uppercase tracking-widest text-neutral-600 ${bg}`}>{label}</div>
      <div className={`p-4 border-t border-r border-neutral-200 text-sm text-center ${bg}`}>{vespa}</div>
      <div className="p-4 border-t border-neutral-700 text-sm text-center text-white/90" style={{ background: odd ? "#0F3C82" : "var(--navy)" }}>{galleria}</div>
    </>
  );
}

function BrandRow({ name, desc, dark }) {
  return (
    <div className={`flex items-center justify-between border-t pt-4 ${dark ? "border-white/15" : "border-neutral-200"}`}>
      <div>
        <div className="font-display text-xl">{name}</div>
        <div className={`text-sm ${dark ? "text-white/60" : "text-neutral-500"} mt-1`}>{desc}</div>
      </div>
      <ArrowRight size={18} className={dark ? "text-white/40" : "text-neutral-400"} />
    </div>
  );
}
