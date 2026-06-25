import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Header, Drawer, FormGrid, Input, Textarea } from "./AdminProducts";

const EMPTY = { title: "", image_url: "", space: "", description: "" };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/gallery").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const payload = { ...form, color_ids: [] };
      if (editing === "new") await api.post("/admin/gallery", payload);
      else await api.patch(`/admin/gallery/${editing}`, payload);
      toast.success("Saved"); setEditing(null); load();
    } catch { toast.error("Save failed"); }
  };
  const remove = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/gallery/${id}`); toast.success("Deleted"); load(); };

  return (
    <div data-testid="admin-gallery">
      <Header title="Gallery" count={items.length} onCreate={() => { setForm(EMPTY); setEditing("new"); }} createTestid="create-gallery" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((g) => (
          <div key={g.id} className="bg-white border border-slate-200" data-testid={`gallery-row-${g.id}`}>
            <div className="aspect-[16/10] overflow-hidden"><img src={g.image_url} alt={g.title} className="w-full h-full object-cover" /></div>
            <div className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500">{g.space}</div>
                <div className="font-medium mt-1">{g.title}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setForm(g); setEditing(g.id); }} className="text-slate-500 hover:text-black" data-testid={`edit-gallery-${g.id}`}><Pencil size={14} /></button>
                <button onClick={() => remove(g.id)} className="text-slate-500 hover:text-red-600" data-testid={`delete-gallery-${g.id}`}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Drawer title={editing === "new" ? "New gallery item" : "Edit gallery item"} onClose={() => setEditing(null)}>
          <FormGrid>
            <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} testid="gallery-form-title" />
            <Input label="Space (e.g. living room)" value={form.space} onChange={(v) => setForm({ ...form, space: v })} testid="gallery-form-space" />
            <Input label="Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} full testid="gallery-form-image" />
            <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} testid="gallery-form-desc" />
            {form.image_url && <div className="col-span-2 aspect-[16/9] border border-slate-200 overflow-hidden"><img src={form.image_url} alt="" className="w-full h-full object-cover" /></div>}
          </FormGrid>
          <div className="mt-6 flex gap-3 justify-end">
            <button className="btn-line" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-solid" onClick={save} data-testid="gallery-form-save">Save</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
