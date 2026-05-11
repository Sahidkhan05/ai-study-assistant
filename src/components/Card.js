export default function Card({ title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 h-12 w-12 rounded-2xl bg-blue-50" />
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </div>
  );
}
