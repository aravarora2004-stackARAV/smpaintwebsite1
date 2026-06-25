import { Link, NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import { Package, Palette, Image as ImageIcon, MessageSquare, LogOut, ExternalLink } from "lucide-react";

const items = [
  { to: "/admin", label: "Overview", icon: Package, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/colors", label: "Colors", icon: Palette },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500" data-testid="admin-loading">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen flex bg-slate-50" data-testid="admin-shell">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <span className="block w-7 h-7" style={{ background: "linear-gradient(135deg,#B65A4B 0%,#8C9986 50%,#2E3A59 100%)" }} />
            <span className="font-display text-lg">Chroma Admin</span>
          </Link>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm border ${isActive ? "border-slate-900 bg-slate-900 text-white" : "border-transparent text-slate-600 hover:bg-slate-100"}`
              }
              data-testid={`admin-nav-${it.label.toLowerCase()}`}
            >
              <it.icon size={16} /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-500 hover:text-black"><ExternalLink size={14} /> View site</a>
          <button onClick={() => { logout(); navigate("/admin/login"); }} className="flex items-center gap-2 text-xs text-slate-500 hover:text-black" data-testid="admin-logout">
            <LogOut size={14} /> Sign out
          </button>
          <div className="text-xs text-slate-400 pt-2">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-x-hidden" data-testid="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
