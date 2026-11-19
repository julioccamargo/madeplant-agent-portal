import { Card } from "../components/ui/Card";

export function PlaceholderPage({ title, bullets = [] }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <Card title="Em breve">
        <p className="text-sm text-slate-600">Estrutura de navegação pronta; dados virão da Agent API / Postgres.</p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}