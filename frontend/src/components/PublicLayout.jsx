import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { api } from "../lib/api";

const links = [
  { to: "/", label: "Home" },
  { to: "/brands", label: "Brands" },
  { to: "/products", label: "Products" },
  { to: "/colors", label: "Shade Card" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const LOGO_URL = "https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/iu3nu4xy_sm%20paints%20final%20logo%20more.png";

export function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState({ brand: "SM Paint Industries", tagline: "Confidence of Quality & Durability | Since 1983", whatsapp_number: "", logo_url: LOGO_URL });
  const loc = useLocation();

  useEffect(() => {
    api.get("/site/config").then((r) => setCfg(r.data)).catch(() => {});
  }, []);
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Top bar — tagline */}
      <div className="hidden md:block" style={{ background: "var(--navy)", color: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-9 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase font-medium">
          <span>{cfg.tagline}</span>
          <span className="flex items-center gap-6">
            <a href={`mailto:${cfg.email || "smpaints2001@gmail.com"}`} className="hover:text-[color:var(--paint-yellow)] normal-case tracking-normal text-[12px]">{cfg.email || "smpaints2001@gmail.com"}</a>
            <span style={{ color: "var(--paint-yellow)" }}>·</span>
            <a href={`tel:${(cfg.phone || "+917669153715").replace(/\s/g,'')}`} className="hover:text-[color:var(--paint-yellow)] normal-case tracking-normal text-[12px]">{cfg.phone || "+91 76691 53715"}</a>
          </span>
        </div>
      </div>

      <div className="paint-strip" />

      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{ background: "rgba(245,242,236,0.92)", borderBottom: "1px solid var(--border)" }}
        data-testid="public-header"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="brand-link">
            <span className="w-11 h-11 flex items-center justify-center" style={{ background: "var(--navy)" }}>
              <img src={cfg.logo_url || LOGO_URL} alt="SM" className="w-9 h-9 object-contain" />
            </span>
            <span>
              <div className="font-display text-base leading-none">SM PAINT</div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-neutral-500 mt-0.5">Industries</div>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-[13px] font-semibold tracking-wide transition-colors uppercase ${loc.pathname === l.to ? "text-[color:var(--navy)]" : "text-neutral-500 hover:text-[color:var(--navy)]"}`}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s/g,'-')}`}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/contact" className="btn-solid !py-2.5 !px-5 text-xs" data-testid="nav-cta-quote">Request Quote</Link>
          </nav>

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle" aria-label="menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t" style={{ borderColor: "var(--border)" }}>
            <div className="px-6 py-6 flex flex-col gap-5">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="text-base font-semibold" data-testid={`nav-mobile-${l.label.toLowerCase().replace(/\s/g,'-')}`}>{l.label}</Link>
              ))}
              <Link to="/contact" className="btn-solid mt-2 text-center">Request Quote</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer style={{ background: "var(--navy)", color: "#fff" }} data-testid="public-footer">
        <div className="paint-strip" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/15">
                <img src={cfg.logo_url || LOGO_URL} alt="SM" className="w-10 h-10 object-contain" />
              </span>
              <div>
                <div className="font-display text-lg">SM PAINT INDUSTRIES</div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-white/60 mt-1">Industrial Coatings · Est. 1983</div>
              </div>
            </div>
            <p className="text-sm text-white/70 max-w-md leading-relaxed">
              Manufacturers of industrial and decorative coatings under the <span className="text-white font-semibold">Vespa</span> and <span className="text-white font-semibold">Galleria</span> lines. Engineered to endure — trusted by builders, contractors, and homeowners across India for over four decades.
            </p>
          </div>
          <div className="md:col-span-3">
            <div className="overline text-white/50 mb-4">Explore</div>
            <div className="flex flex-col gap-2.5 text-sm">
              {links.map((l) => (<Link key={l.to} to={l.to} className="hover:text-[color:var(--paint-yellow)] text-white/80">{l.label}</Link>))}
            </div>
          </div>
          <div className="md:col-span-4">
            <div className="overline text-white/50 mb-4">Contact</div>
            <div className="text-sm text-white/80 space-y-1.5">
              <div><a href="mailto:smpaints2001@gmail.com" className="hover:text-[color:var(--paint-yellow)]">smpaints2001@gmail.com</a></div>
              <div><a href="tel:+917669153715" className="hover:text-[color:var(--paint-yellow)]">+91 76691 53715</a></div>
              <div>Chandni Chowk, New Delhi · India</div>
              <div className="pt-4">
                <Link to="/admin/login" className="text-xs text-white/40 hover:text-white" data-testid="footer-admin-link">Dealer / Admin login</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 text-xs text-white/50 flex flex-col md:flex-row justify-between gap-2">
            <span>© {new Date().getFullYear()} SM Paint Industries. All rights reserved.</span>
            <span className="font-mono">CONFIDENCE OF QUALITY · DURABILITY · SINCE 1983</span>
          </div>
        </div>
      </footer>

      {cfg.whatsapp_number && (
        <a
          href={`https://wa.me/${cfg.whatsapp_number}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105"
          style={{ background: "#25D366", color: "white" }}
          data-testid="whatsapp-fab"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
      )}
    </div>
  );
}
