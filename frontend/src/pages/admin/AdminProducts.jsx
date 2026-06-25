import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const EMPTY = {
  name: "", line: "vespa", category: "enamel", finish: "gloss",
  short_description: "", description: "",
  features: "",  // comma separated in UI
  coverage: "", coverage_detail: "",
  drying_time: "", recoat_time: "",
  application: "", pack_sizes: "",
  thinner: "", recommended_primer: "", available_shades: "",
  price: "", image_url: "", featured: false, sort_order: 0,
};

const LINES = ["vespa", "galleria", "general"];
const CATEGORIES = ["enamel", "primer", "distemper", "varnish", "industrial", "specialty"];
const FINISHES = ["matte", "satin", "gloss", "lustrous", "textured", "transparent"];

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/products").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing("new"); };
  const openEdit = (it) => {
    setForm({
      ...EMPTY, ...it,
      features: (it.features || []).join("\n"),
      pack_sizes: (it.pack_sizes || []).join(", "),
      price: it.price ?? "",
    });
    setEditing(it.id);
  };

  const save = async () => {
    const payload = {
      ...form,
      features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
      pack_sizes: form.pack_sizes.split(",").map((s) => s.trim()).filter(Boolean),
      price: form.price === "" || form.price === null ? null : Number(form.price),
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (editing === "new") await api.post("/admin/products", payload);
      else await api.patch(`/admin/products/${editing}`, payload);
      toast.success("Saved");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail?.toString() || "Save failed");
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
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Line</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Finish</th>
              <th className="text-left px-4 py-3">Coverage</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100" data-testid={`row-product-${it.id}`}>
                <td className="px-4 py-3 font-medium">{it.name} {it.featured && <span className="ml-2 text-[10px] uppercase tracking-widest bg-amber-400 text-slate-900 px-1.5 py-0.5">Featured</span>}</td>
                <td className="px-4 py-3"><span className={`line-pill ${it.line}`}>{it.line}</span></td>
                <td className="px-4 py-3 capitalize">{it.category}</td>
                <td className="px-4 py-3 capitalize">{it.finish}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-600">{it.coverage}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
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
          <div className="space-y-6">
            <Section title="Basics">
              <FormGrid>
                <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="form-name" full />
                <Select label="Line" value={form.line} onChange={(v) => setForm({ ...form, line: v })} options={LINES} testid="form-line" />
                <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES} testid="form-category" />
                <Select label="Finish" value={form.finish} onChange={(v) => setForm({ ...form, finish: v })} options={FINISHES} testid="form-finish" />
                <Input label="Sort order" type="number" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} testid="form-sort" />
                <Input label="Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} testid="form-image" full />
                <Textarea label="Short description (one-liner)" value={form.short_description} onChange={(v) => setForm({ ...form, short_description: v })} testid="form-short" />
                <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} testid="form-desc" />
              </FormGrid>
            </Section>

            <Section title="Features">
              <Textarea label="Features (one per line)" value={form.features} onChange={(v) => setForm({ ...form, features: v })} testid="form-features" rows={5} />
            </Section>

            <Section title="Technical data">
              <FormGrid>
                <Input label="Coverage (short)" value={form.coverage} onChange={(v) => setForm({ ...form, coverage: v })} testid="form-coverage" />
                <Input label="Coverage detail" value={form.coverage_detail} onChange={(v) => setForm({ ...form, coverage_detail: v })} testid="form-coverage-detail" full />
                <Input label="Drying time" value={form.drying_time} onChange={(v) => setForm({ ...form, drying_time: v })} testid="form-drying" />
                <Input label="Recoat / hard dry" value={form.recoat_time} onChange={(v) => setForm({ ...form, recoat_time: v })} testid="form-recoat" />
                <Input label="Application" value={form.application} onChange={(v) => setForm({ ...form, application: v })} testid="form-application" full />
                <Input label="Thinner" value={form.thinner} onChange={(v) => setForm({ ...form, thinner: v })} testid="form-thinner" />
                <Input label="Recommended primer" value={form.recommended_primer} onChange={(v) => setForm({ ...form, recommended_primer: v })} testid="form-primer" />
                <Input label="Pack sizes (comma sep)" value={form.pack_sizes} onChange={(v) => setForm({ ...form, pack_sizes: v })} testid="form-pack" full />
                <Input label="Available shades" value={form.available_shades} onChange={(v) => setForm({ ...form, available_shades: v })} testid="form-shades" full />
                <Input label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testid="form-price" />
                <label className="flex items-center gap-2 col-span-2 mt-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} data-testid="form-featured" /> Mark as Featured</label>
              </FormGrid>
            </Section>
          </div>
          <div className="mt-8 flex gap-3 justify-end sticky bottom-0 bg-white pt-4 border-t border-slate-200">
            <button className="btn-line" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-solid" onClick={save} data-testid="form-save">Save</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-500 mb-3">{title}</div>
      {children}
    </div>
  );
}

export function Header({ title, count, onCreate, createTestid }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500">{title}</div>
        <h1 className="font-display text-3xl mt-1" style={{ color: "var(--ink)" }}>All {title.toLowerCase()} <span className="font-mono text-base text-slate-400 ml-2">{count}</span></h1>
      </div>
      {onCreate && <button className="btn-solid" onClick={onCreate} data-testid={createTestid}><Plus size={14} className="mr-2" /> New</button>}
    </div>
  );
}

export function Drawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-3">
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
export function Textarea({ label, value, onChange, testid, rows = 3 }) {
  return (
    <div className="col-span-2">
      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</label>
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full border border-slate-300 px-3 py-2 outline-none focus:border-black" data-testid={testid} />
    </div>
  );
}
