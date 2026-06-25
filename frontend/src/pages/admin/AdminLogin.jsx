import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/admin");
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(typeof msg === "string" ? msg : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" data-testid="admin-login-page">
      <div className="w-full max-w-md bg-white border border-slate-200 p-10">
        <div className="mb-8">
          <div className="overline text-slate-500 mb-2">Chroma Paints</div>
          <div className="font-display text-3xl">Admin sign in</div>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-slate-300 px-3 py-2 outline-none focus:border-black" data-testid="login-email" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-slate-300 px-3 py-2 outline-none focus:border-black" data-testid="login-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-solid w-full disabled:opacity-50" data-testid="login-submit">{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="mt-6 text-xs text-slate-500">Authorized personnel only.</div>
      </div>
    </div>
  );
}
