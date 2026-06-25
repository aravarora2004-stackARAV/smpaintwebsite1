import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Header } from "./AdminProducts";

const STATUSES = ["new", "in_progress", "closed"];

export default function AdminInquiries() {
  const [items, setItems] = useState([]);

  const load = () => api.get("/admin/inquiries").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.patch(`/admin/inquiries/${id}`, { status });
    toast.success("Updated");
    load();
  };
  const remove = async (id) => { if (!window.confirm("Delete inquiry?")) return; await api.delete(`/admin/inquiries/${id}`); toast.success("Deleted"); load(); };

  return (
    <div data-testid="admin-inquiries">
      <Header title="Inquiries" count={items.length} />
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 align-top" data-testid={`row-inquiry-${it.id}`}>
                <td className="px-4 py-3"><div className="font-medium">{it.name}</div><div className="text-xs text-slate-500">{it.email || "—"}</div></td>
                <td className="px-4 py-3">{it.phone}</td>
                <td className="px-4 py-3">{it.city || "—"}</td>
                <td className="px-4 py-3">{it.product_interest || "—"}<div className="text-xs text-slate-500 max-w-xs truncate">{it.message}</div></td>
                <td className="px-4 py-3">
                  <select value={it.status} onChange={(e) => setStatus(it.id, e.target.value)} className="border border-slate-300 px-2 py-1 bg-white text-xs" data-testid={`status-${it.id}`}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(it.id)} className="text-slate-500 hover:text-red-600" data-testid={`delete-inquiry-${it.id}`}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (<tr><td colSpan={6} className="text-center py-12 text-slate-500" data-testid="inquiries-empty">No inquiries yet.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
