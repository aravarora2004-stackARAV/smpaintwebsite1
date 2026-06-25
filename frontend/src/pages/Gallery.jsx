import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { X } from "lucide-react";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => { api.get("/gallery").then((r) => setItems(r.data)); }, []);

  return (
    <div data-testid="gallery-page">
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-10">
        <div className="overline text-neutral-500 mb-3">In Place</div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Projects & inspiration</h1>
        <p className="mt-4 text-neutral-600 max-w-2xl">Selected residential, commercial, and heritage projects finished in Chroma palettes.</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="grid grid-cols-6 gap-4 stagger">
          {items.map((g, idx) => {
            const shapes = [
              "col-span-6 md:col-span-4 aspect-[16/10]",
              "col-span-3 md:col-span-2 aspect-[4/5]",
              "col-span-3 md:col-span-2 aspect-square",
              "col-span-6 md:col-span-4 aspect-[16/9]",
            ];
            const span = shapes[idx % shapes.length];
            return (
              <button
                key={g.id}
                className={`${span} overflow-hidden hairline relative group`}
                onClick={() => setActive(g)}
                data-testid={`gallery-item-${g.id}`}
              >
                <img src={g.image_url} alt={g.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-5">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="overline">{g.space}</div>
                    <div className="font-display text-2xl">{g.title}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {items.length === 0 && <div className="text-center text-neutral-500 py-20" data-testid="gallery-empty">No gallery items yet.</div>}
      </section>

      {active && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setActive(null)} data-testid="gallery-lightbox">
          <button className="absolute top-6 right-6 text-white" onClick={() => setActive(null)} data-testid="lightbox-close"><X size={28} /></button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={active.image_url} alt={active.title} className="w-full max-h-[80vh] object-contain" />
            <div className="text-white mt-5">
              <div className="overline text-neutral-400">{active.space}</div>
              <div className="font-display text-3xl mt-1">{active.title}</div>
              {active.description && <div className="text-neutral-300 mt-2 max-w-2xl">{active.description}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
