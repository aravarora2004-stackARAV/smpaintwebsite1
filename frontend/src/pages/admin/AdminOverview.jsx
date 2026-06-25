import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, colors: 0, gallery: 0, inquiries: 0, newInquiries: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/products"),
      api.get("/colors"),
      api.get("/gallery"),
      api.get("/admin/inquiries"),
    ]).then(([p, c, g, i]) => {
      setStats({
        products: p.data.length,
        colors: c.data.length,
        gallery: g.data.length,
        inquiries: i.data.length,
        newInquiries: i.data.filter((x) => x.status === "new").length,
      });
    });
  }, []);

  const tiles = [
    { label: "Products", value: stats.products },
    { label: "Colors", value: stats.colors },
    { label: "Gallery items", value: stats.gallery },
    { label: "Inquiries", value: stats.inquiries, hint: `${stats.newInquiries} new` },
  ];

  return (
    <div data-testid="admin-overview">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-slate-500">Overview</div>
        <h1 className="font-display text-3xl mt-1">Welcome back.</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white border border-slate-200 p-6" data-testid={`tile-${t.label.toLowerCase().replace(/\s/g, '-')}`}>
            <div className="text-xs uppercase tracking-widest text-slate-500">{t.label}</div>
            <div className="font-display text-4xl mt-3">{t.value}</div>
            {t.hint && <div className="text-xs text-slate-500 mt-2">{t.hint}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
