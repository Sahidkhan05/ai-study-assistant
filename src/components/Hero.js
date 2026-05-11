import Link from "next/link";

export default function Hero({ title, description, buttonText, buttonHref }) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Smart learning, simple workflow
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={buttonHref}
              className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {buttonText}
            </Link>
            <Link
              href="/about"
              className="rounded-xl border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-xl">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600" />
              <div>
                <p className="font-semibold text-slate-950">Study Coach</p>
                <p className="text-sm text-slate-500">Online now</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
                What topic are you studying today?
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-3 text-sm text-white">
                Explain photosynthesis in simple words.
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
                Plants use sunlight, water, and carbon dioxide to make food and
                release oxygen.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
