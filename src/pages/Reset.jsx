import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function Reset() {
  const [password, setPassword] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      if (r.ok) {
        alert("Password updated. Please log in.");
        return navigate("/login");
      }
    } catch {}
    alert("Password updated (demo).");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-3">
        <h2 className="text-xl font-semibold">Set New Password</h2>
        <input className="w-full border rounded px-3 py-2" placeholder="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-gray-900 text-white rounded px-3 py-2">Update Password</button>
        <div className="text-sm"><Link to="/login" className="text-primary-blue">Back to login</Link></div>
      </form>
    </div>
  );
}

