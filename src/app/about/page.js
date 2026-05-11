export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          About
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          A cleaner way to study with AI
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          AI Study Assistant is a beginner-friendly learning website built with
          Next.js App Router and Tailwind CSS. It gives students a simple place
          to ask questions, review ideas, and get AI-style explanations without
          extra setup.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <h2 className="font-bold text-slate-950">Simple</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Clear pages and readable code make the project easy to understand.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <h2 className="font-bold text-slate-950">Responsive</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Layouts work well on phones, tablets, and desktop screens.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <h2 className="font-bold text-slate-950">Practical</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The chat page connects to a local API route using fetch.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
