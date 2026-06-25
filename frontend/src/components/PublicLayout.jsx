import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { api } from "../lib/api";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/colors", label: "Colors" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState({ brand: "Chroma Paints", whatsapp_number: "" });
  const loc = useLocation();

  useEffect(() => {
    api.get("/site/config").then((r) => setCfg(r.data)).catch(() => {});
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{ background: "rgba(249,248,246,0.78)", borderBottom: "1px solid var(--border)" }}
        data-testid="public-header"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="brand-link">
            <span className="block w-8 h-8" style={{ background: "linear-gradient(135deg,#B65A4B 0%,#8C9986 50%,#2E3A59 100%)" }} />
            <span className="font-display text-xl tracking-tight">{cfg.brand}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm tracking-wide transition-colors ${loc.pathname === l.to ? "text-black" : "text-neutral-500 hover:text-black"}`}
                data-testid={`nav-${l.label.toLowerCase()}`}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/contact" className="btn-line" data-testid="nav-cta-quote">Request Quote</Link>
          </nav>
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            data-testid="nav-mobile-toggle"
            aria-label="menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t" style={{ borderColor: "var(--border)" }}>
            <div className="px-6 py-6 flex flex-col gap-5">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="text-base" data-testid={`nav-mobile-${l.label.toLowerCase()}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t" style={{ borderColor: "var(--border)" }} data-testid="public-footer">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="font-display text-3xl mb-4">{cfg.brand}</div>
            <p className="text-sm text-neutral-600 max-w-md leading-relaxed">
              A manufacturer of architectural finishes, premium emulsions, and a curated color
              library — built for designers, contractors, and discerning homeowners.
            </p>
          </div>
          <div>
            <div className="overline text-neutral-500 mb-4">Explore</div>
            <div className="flex flex-col gap-2 text-sm">
              {links.map((l) => (<Link key={l.to} to={l.to} className="hover:text-black text-neutral-600">{l.label}</Link>))}
            </div>
          </div>
          <div>
            <div className="overline text-neutral-500 mb-4">Contact</div>
            <div className="text-sm text-neutral-600 space-y-1">
              <div>hello@chromapaints.com</div>
              <div>+91 9999 999 999</div>
              <div className="pt-3">
                <Link to="/admin/login" className="text-xs text-neutral-400 hover:text-black" data-testid="footer-admin-link">Dealer / Admin</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 text-xs text-neutral-500 flex justify-between">
            <span>© {new Date().getFullYear()} {cfg.brand}. All rights reserved.</span>
            <span className="font-mono">made with color.</span>
          </div>
        </div>
      </footer>

      {cfg.whatsapp_number && (
        <a
          href={`https://wa.me/${cfg.whatsapp_number}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
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
