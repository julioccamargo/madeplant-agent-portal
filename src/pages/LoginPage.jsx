import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/80">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
          M
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Entrar no portal</h1>
        <p className="mt-2 text-sm text-slate-500">Lab: proxy Dokploy autentica na API. Informe um nome para auditoria.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            login(name || "Lab");
            navigate("/");
          }}
        >
          <label className="block text-sm font-medium text-slate-700">
            Nome exibido
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin lab"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}