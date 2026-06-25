import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Header, Drawer, FormGrid, Input, Select } from "./AdminProducts";

const EMPTY = { name: "", hex: "#000000", family: "neutrals", code: "", collection: "Whites, Beiges, Browns & Greys" };
const FAMILIES = ["whites", "beiges", "browns", "greys", "blues", "greens", "violets", "pastels", "yellows", "peaches", "oranges", "reds", "pinks"];
const COLLECTIONS = [
  "Whites, Beiges, Browns & Greys",
  "Yellows, Peaches, Oranges, Reds & Pinks",
  "Blues, Greens & Violets",
  "Interior Combinations",
];

export default function AdminColors() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState("All");

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

  const visible = filter === "All" ? items : items.filter((c) => c.collection === filter);

  return (
    <div data-testid="admin-colors">
      <Header title="Colors" count={items.length} onCreate={() => { setForm(EMPTY); setEditing("new"); }} createTestid="create-color" />

      <div className="flex items-center gap-3 flex-wrap mb-5">
        <span className="text-xs uppercase tracking-widest text-slate-500">Collection</span>
        {["All", ...COLLECTIONS].map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`text-xs uppercase tracking-widest px-3 py-1.5 border ${filter === c ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 hover:border-slate-900"}`} data-testid={`admin-collection-${c.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`}>{c === "All" ? "All" : c.split(",")[0]}</button>
        ))}
        <span className="ml-auto font-mono text-xs text-slate-500">{visible.length}</span>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map((c) => (
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
            <Select label="Family" value={form.family} onChange={(v) => setForm({ ...form, family: v })} options={FAMILIES} testid="color-form-family" />
            <Input label="Hex" value={form.hex} onChange={(v) => setForm({ ...form, hex: v })} testid="color-form-hex" />
            <Select label="Collection" value={form.collection} onChange={(v) => setForm({ ...form, collection: v })} options={COLLECTIONS} testid="color-form-collection" />
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
