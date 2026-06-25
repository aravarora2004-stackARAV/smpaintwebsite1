import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const EMPTY = {
  name: "", category: "interior", finish: "matte", coverage: "",
  pack_sizes: "", price: "", description: "", image_url: "", featured: false,
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/products").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing("new"); };
  const openEdit = (it) => {
    setForm({
      ...it,
      pack_sizes: (it.pack_sizes || []).join(", "),
      price: it.price ?? "",
    });
    setEditing(it.id);
  };

  const save = async () => {
    const payload = {
      ...form,
      pack_sizes: form.pack_sizes.split(",").map((s) => s.trim()).filter(Boolean),
      price: form.price === "" ? null : Number(form.price),
      swatch_color_ids: form.swatch_color_ids || [],
    };
    try {
      if (editing === "new") await api.post("/admin/products", payload);
      else await api.patch(`/admin/products/${editing}`, payload);
      toast.success("Saved");
      setEditing(null);
      load();
    } catch (e) {
      toast.error("Save failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div data-testid="admin-products">
      <Header title="Products" count={items.length} onCreate={openCreate} createTestid="create-product" />
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Finish</th><th className="text-left px-4 py-3">Price</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100" data-testid={`row-product-${it.id}`}>
                <td className="px-4 py-3 font-medium">{it.name} {it.featured && <span className="ml-2 text-[10px] uppercase tracking-widest bg-black text-white px-1.5 py-0.5">Featured</span>}</td>
                <td className="px-4 py-3 capitalize">{it.category}</td>
                <td className="px-4 py-3 capitalize">{it.finish}</td>
                <td className="px-4 py-3">{it.price ? `₹${it.price}` : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(it)} className="text-slate-500 hover:text-black mr-3" data-testid={`edit-product-${it.id}`}><Pencil size={14} /></button>
                  <button onClick={() => remove(it.id)} className="text-slate-500 hover:text-red-600" data-testid={`delete-product-${it.id}`}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Drawer title={editing === "new" ? "New product" : "Edit product"} onClose={() => setEditing(null)}>
          <FormGrid>
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="form-name" />
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={["interior", "exterior", "primer", "enamel", "distemper"]} testid="form-category" />
            <Select label="Finish" value={form.finish} onChange={(v) => setForm({ ...form, finish: v })} options={["matte", "satin", "gloss", "eggshell", "textured"]} testid="form-finish" />
            <Input label="Coverage" value={form.coverage} onChange={(v) => setForm({ ...form, coverage: v })} testid="form-coverage" />
            <Input label="Pack sizes (comma sep)" value={form.pack_sizes} onChange={(v) => setForm({ ...form, pack_sizes: v })} testid="form-pack" />
            <Input label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testid="form-price" />
            <Input label="Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} testid="form-image" full />
            <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} testid="form-desc" />
            <label className="flex items-center gap-2 col-span-2 mt-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} data-testid="form-featured" /> Featured</label>
          </FormGrid>
          <div className="mt-6 flex gap-3 justify-end">
            <button className="btn-line" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-solid" onClick={save} data-testid="form-save">Save</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}

export function Header({ title, count, onCreate, createTestid }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500">{title}</div>
        <h1 className="font-display text-3xl mt-1">All {title.toLowerCase()} <span className="font-mono text-base text-slate-400 ml-2">{count}</span></h1>
      </div>
      {onCreate && <button className="btn-solid" onClick={onCreate} data-testid={createTestid}><Plus size={14} className="mr-2" /> New</button>}
    </div>
  );
}

export function Drawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-xl bg-white h-full overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="font-display text-2xl">{title}</div>
          <button onClick={onClose} data-testid="drawer-close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormGrid({ children }) { return <div className="grid grid-cols-2 gap-4">{children}</div>; }
export function Input({ label, value, onChange, type = "text", full, testid }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</label>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-300 px-3 py-2 outline-none focus:border-black" data-testid={testid} />
    </div>
  );
}
export function Select({ label, value, onChange, options, testid }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-300 px-3 py-2 bg-white outline-none focus:border-black" data-testid={testid}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
export function Textarea({ label, value, onChange, testid }) {
  return (
    <div className="col-span-2">
      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</label>
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full border border-slate-300 px-3 py-2 outline-none focus:border-black" data-testid={testid} />
    </div>
  );
}
