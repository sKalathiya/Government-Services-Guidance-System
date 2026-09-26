import { Link, Navigate } from "react-router-dom";
import useAuthenticatedUser from "../features/auth/hooks/useAuthenticatedUser";

const guidanceSteps = [
  {
    number: "01",
    title: "Find the right service",
    description:
      "Search by service name and narrow results to the jurisdiction that applies to you.",
  },
  {
    number: "02",
    title: "Prepare your documents",
    description:
      "Review eligibility, required documents, fees, and expected processing time.",
  },
  {
    number: "03",
    title: "Follow clear steps",
    description:
      "Use the application checklist and continue to the official government portal.",
  },
];

const guidanceBenefits = [
  {
    title: "Eligibility explained",
    description: "Understand who can apply before starting.",
  },
  {
    title: "Document checklist",
    description: "Gather the correct evidence without guesswork.",
  },
  {
    title: "Official destinations",
    description: "Continue safely to verified government portals.",
  },
];

export function HomePage() {
  const { data, isPending } = useAuthenticatedUser();
  if (isPending) return null;
  if (data) return <Navigate to="/services" replace />;

  return (
    <div className="space-y-16 sm:space-y-20">
      <section
        aria-labelledby="home-heading"
        className="relative overflow-hidden rounded-card border border-brand/10 bg-linear-to-br from-brand-soft via-surface to-accent-soft px-6 py-12 shadow-card sm:px-10 sm:py-16 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Clear government guidance
          </p>

          <h1
            id="home-heading"
            className="mt-4 text-4xl font-bold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl"
          >
            Government services, explained clearly.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            Find eligibility rules, required documents, application steps, and
            official links in one trustworthy place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/services"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-strong"
            >
              Browse services
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-surface/80 px-6 py-3 text-sm font-semibold text-brand transition-colors hover:border-brand/30 hover:bg-brand-soft"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="relative mt-10 lg:mt-0">
          <div className="overflow-hidden rounded-card border border-white/70 bg-surface/85 shadow-card backdrop-blur-sm">
            <div
              aria-hidden="true"
              className="h-1.5 bg-linear-to-r from-brand via-accent to-highlight"
            />
            <div className="p-6 sm:p-7">
            <p className="text-sm font-semibold text-accent">
              Plan with confidence
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              Know what you need before you apply
            </h2>

            <ul className="mt-6 space-y-5">
              {guidanceBenefits.map((benefit) => (
                <li key={benefit.title} className="flex gap-3 items-center">
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent"
                  >
                    ✓
                  </span>

                  <div>
                    <p className="font-semibold text-ink">{benefit.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="space-y-8 scroll-mt-24"
      >
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            A simpler process
          </p>

          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight text-ink"
          >
            From question to application
          </h2>

          <p className="leading-7 text-muted">
            GovGuide organizes complex service information into a practical path
            you can follow.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {guidanceSteps.map((step) => (
            <article
              key={step.number}
              className="group rounded-card border border-line bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-card motion-reduce:transform-none"
            >
              <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-sm font-bold text-highlight transition-colors group-hover:bg-brand group-hover:text-white">
                {step.number}
              </span>

              <h3 className="mt-4 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
