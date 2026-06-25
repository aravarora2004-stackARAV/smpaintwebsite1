import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Header, Drawer, FormGrid, Input } from "./AdminProducts";

const EMPTY = { name: "", hex: "#000000", family: "", code: "" };

export default function AdminColors() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/colors").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing === "new") await api.post("/admin/colors", form);
      else await api.patch(`/admin/colors/${editing}`, form);
      toast.success("Saved"); setEditing(null); load();
    } catch { toast.error("Save failed"); }
  };
  const remove = async (id) => { if (!window.confirm("Delete this color?")) return; await api.delete(`/admin/colors/${id}`); toast.success("Deleted"); load(); };

  return (
    <div data-testid="admin-colors">
      <Header title="Colors" count={items.length} onCreate={() => { setForm(EMPTY); setEditing("new"); }} createTestid="create-color" />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 overflow-hidden" data-testid={`color-row-${c.id}`}>
            <div className="aspect-[4/3]" style={{ background: c.hex }} />
            <div className="p-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-slate-500">{c.code}</div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-slate-500">{c.family} · {c.hex}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setForm(c); setEditing(c.id); }} className="text-slate-500 hover:text-black" data-testid={`edit-color-${c.id}`}><Pencil size={14} /></button>
                <button onClick={() => remove(c.id)} className="text-slate-500 hover:text-red-600" data-testid={`delete-color-${c.id}`}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Drawer title={editing === "new" ? "New color" : "Edit color"} onClose={() => setEditing(null)}>
          <FormGrid>
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="color-form-name" />
            <Input label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} testid="color-form-code" />
            <Input label="Family" value={form.family} onChange={(v) => setForm({ ...form, family: v })} testid="color-form-family" />
            <Input label="Hex" value={form.hex} onChange={(v) => setForm({ ...form, hex: v })} testid="color-form-hex" />
            <div className="col-span-2 aspect-[6/2] border border-slate-200" style={{ background: form.hex }} />
          </FormGrid>
          <div className="mt-6 flex gap-3 justify-end">
            <button className="btn-line" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-solid" onClick={save} data-testid="color-form-save">Save</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
