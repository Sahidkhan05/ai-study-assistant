import Card from "@/components/Card";
import Hero from "@/components/Hero";

export default function Home() {
  const features = [
    {
      title: "Ask Study Questions",
      description:
        "Get quick explanations for homework, concepts, definitions, and revision topics.",
    },
    {
      title: "Learn Step by Step",
      description:
        "Break difficult ideas into simple, beginner-friendly answers that are easier to remember.",
    },
    {
      title: "Practice Anytime",
      description:
        "Use the chat page whenever you need a study partner for notes, summaries, or examples.",
    },
  ];

  return (
    <main className="bg-slate-50">
      <Hero
        title="AI Study Assistant"
        description="A modern learning website that helps students ask questions, understand topics, and study with a clean AI chat experience."
        buttonText="Start Studying"
        buttonHref="/chat"
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Everything you need for focused study
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            The site is simple on purpose: clear pages, fast navigation, and a
            chat assistant ready to help you learn.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
