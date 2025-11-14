import { useState } from "react";
import { Link } from "react-router-dom";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [demoLink, setDemoLink] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const r = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await r.json();
      if (data?.demo_link) setDemoLink(data.demo_link);
      alert("If the email exists, a reset link was sent.");
    } catch {
      alert("If the email exists, a reset link was sent. (demo)");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Forgot Password</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button type="submit" className="w-full bg-gray-900 text-white rounded px-3 py-2">Send Reset Link</button>
        </form>
        {demoLink && (
          <p className="text-sm mt-3">Demo link: <a className="text-primary-blue" href={demoLink}>{demoLink}</a></p>
        )}
        <div className="text-sm mt-3"><Link to="/login" className="text-primary-blue">Back to login</Link></div>
      </div>
    </div>
  );
}

