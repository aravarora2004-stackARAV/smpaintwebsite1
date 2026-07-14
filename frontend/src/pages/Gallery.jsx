import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { X } from "lucide-react";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => { api.get("/gallery").then((r) => setItems(r.data)); }, []);
  const projectVideos = [
  {
    src: "/project-media/project-video-1.mp4",
    title: "VESPA PO Red Paint",
    subtitle: "Scaffolding, Industrial Use",
    desc: "Built for industrial scaffolding structures, VESPA PO Red Paint delivers a high-gloss finish with excellent viscosity for smooth, even application. It is engineered to handle tough job-site conditions while staying one of the most competitively priced options in its category — no compromise on finish quality.",
  },
  {
    src: "/project-media/project-video-2.mp4",
    title: "VESPA Oil Bound White Distemper",
    subtitle: "Factory Walls",
    desc: "Applied across the walls of a brand-new factory project, VESPA OBD gives large industrial spaces a clean, bright white finish. A practical, cost-effective choice for covering expansive factory walls with smooth, consistent coverage.",
  },
  {
    src: "/project-media/project-video-3.mp4",
    title: "VESPA White Paint",
    subtitle: "Staircase, Residential Interior Emulsion",
    desc: "A VESPA Interior Emulsion in crisp white, applied to a residential staircase. The smooth, uniform finish is built for high-traffic interior spaces that need to stay looking clean and bright, wear after wear.",
  },
  {
    src: "/project-media/project-video-4.mp4",
    title: "VESPA Interior Emulsion",
    subtitle: "Morning Glory Shade, Residential Matte Finish",
    desc: "Finished in VESPA's Morning Glory shade, this residential application showcases a soft matte finish with rich, even color depth. Delivered at an affordable price point, it left the customer completely satisfied — both in look and value.",
  },
  {
    src: "/project-media/project-video-5.mp4",
    title: "VESPA Interior Emulsion",
    subtitle: "Ice Crystal for Ceiling, Enlighten for Walls",
    desc: "Two VESPA Interior Emulsion shades — Ice Crystal on the ceiling, Enlighten on the walls — matched to perfection for a seamless look throughout the room. The result: a flawless matte finish with 100% quality consistency across both surfaces.",
  },
  {
    src: "/project-media/project-video-6.mp4",
    title: "GALLERIA Clear Varnish",
    subtitle: "Wooden Furniture",
    desc: "GALLERIA Clear Varnish brings out the natural wood grain with a rich, glass-like gloss on this outdoor table. It protects against daily wear while enhancing the wood's warmth and shine — ideal for furniture that needs to look as good as it holds up.",
  },
  {
    src: "/project-media/project-video-7.mp4",
    title: "GALLERIA Red Oxide Primer",
    subtitle: "Metal Surface, Industrial Spray Application",
    desc: "Applied via spray on industrial metal surfaces, GALLERIA Red Oxide Primer lays down a smooth, high-gloss base coat built for durability. Excellent sprayability made for a fast, flawless application — with fantastic end results.",
  },
];

  return (
    <div data-testid="gallery-page">
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-10">
        <div className="overline text-neutral-500 mb-3">In Place</div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Projects & inspiration</h1>
        <p className="mt-4 text-neutral-600 max-w-2xl">Selected residential, commercial, and heritage projects finished in Chroma palettes.</p>
      </section> <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
    <div>
      <div className="overline text-neutral-500 mb-3">Real project media</div>
      <h2 className="font-display text-4xl tracking-tight">Projects we’ve coated</h2>
      <p className="mt-3 text-neutral-600 max-w-2xl">
        Real videos from coated sites, product applications, and finished surfaces using SM Paint Industries coatings.
      </p>
    </div>
  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {projectVideos.map((video, index) => (
      <div key={video.src} className="card-surface card-surface-brand overflow-hidden bg-white">
        <div className="aspect-[4/5] bg-neutral-100">
          <video
            src={video.src}
            controls
            preload="metadata"
            className="w-full h-full object-cover"
            data-testid={`project-video-${index + 1}`}
          />
        </div>
        <div className="p-5 bg-white border border-neutral-200">
  <div className="overline text-neutral-500 mb-2">Project Testimonial</div>
  <h3 className="font-display text-2xl" style={{ color: "var(--ink)" }}>
    {video.title}
  </h3>
  <div className="mt-1 text-sm font-semibold" style={{ color: "var(--navy)" }}>
    {video.subtitle}
  </div>
  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
    {video.desc}
  </p>
</div>
      </div>
    ))}
  </div>
</section>
</div>
  );
}

     

     
