import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Check } from "lucide-react";

export default function Contact() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", product_interest: params.get("product") || "", message: "" });
  useEffect(() => { const p = params.get("product"); if (p) setForm((f) => ({ ...f, product_interest: p })); }, [params]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please share your name and phone number.");
      return;
    }
    setSending(true);
    try {
      const payload = { ...form };
      if (!payload.email) delete payload.email;
      await api.post("/inquiries", payload);
      setDone(true);
      toast.success("Inquiry received. We'll be in touch within 24 hours.");
    } catch (err) {
      toast.error(err.response?.data?.detail?.toString() || "Could not send. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid lg:grid-cols-12 gap-12" data-testid="contact-page">
      <div className="lg:col-span-5">
        <div className="overline text-neutral-500 mb-3">Talk to us</div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight leading-none">Request a quote.</h1>
        <p className="mt-6 text-neutral-600 leading-relaxed">
          Share a few details about your project and our team will get back within 24 hours with
          recommended products, color suggestions, and a pricing estimate.
        </p>

        <div className="mt-10 space-y-4">
          <Detail label="Email" value="hello@chromapaints.com" />
          <Detail label="Phone" value="+91 9999 999 999" />
          <Detail label="Studio" value="Plot 17, Industrial Estate, Mumbai" />
          <Detail label="Hours" value="Mon — Sat, 10:00 to 19:00" />
        </div>
      </div>

      <div className="lg:col-span-7">
        {done ? (
          <div className="hairline p-12 bg-white text-center" data-testid="inquiry-success">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-black text-white mb-6"><Check size={20} /></div>
            <div className="font-display text-3xl mb-2">Thank you, {form.name.split(" ")[0]}</div>
            <p className="text-neutral-600">Your inquiry is in. Our team will reach out within 24 hours.</p>
            <button onClick={() => { setDone(false); setForm({ name: "", phone: "", email: "", city: "", product_interest: "", message: "" }); }} className="btn-line mt-8" data-testid="inquiry-reset">Send another inquiry</button>
          </div>
        ) : (
          <form onSubmit={submit} className="hairline p-8 lg:p-12 bg-white space-y-6" data-testid="inquiry-form">
            <Field label="Full name *" value={form.name} onChange={onChange("name")} testid="inquiry-name" />
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Phone *" value={form.phone} onChange={onChange("phone")} testid="inquiry-phone" />
              <Field label="Email" type="email" value={form.email} onChange={onChange("email")} testid="inquiry-email" />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="City" value={form.city} onChange={onChange("city")} testid="inquiry-city" />
              <Field label="Product of interest" value={form.product_interest} onChange={onChange("product_interest")} testid="inquiry-product" />
            </div>
            <div>
              <label className="overline text-neutral-500 block mb-2">Project details</label>
              <textarea
                value={form.message}
                onChange={onChange("message")}
                rows={5}
                className="w-full border-b border-neutral-300 bg-transparent pb-2 outline-none focus:border-black resize-none"
                placeholder="Tell us about your space, timeline, and aesthetic..."
                data-testid="inquiry-message"
              />
            </div>
            <button type="submit" disabled={sending} className="btn-solid w-full sm:w-auto disabled:opacity-50" data-testid="inquiry-submit">
              {sending ? "Sending…" : "Send inquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", testid }) {
  return (
    <div>
      <label className="overline text-neutral-500 block mb-2">{label}</label>
      <input type={type} value={value} onChange={onChange} data-testid={testid} className="w-full border-b border-neutral-300 bg-transparent pb-2 outline-none focus:border-black" />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="overline text-neutral-500">{label}</div>
      <div className="mt-1 text-base">{value}</div>
    </div>
  );
}
