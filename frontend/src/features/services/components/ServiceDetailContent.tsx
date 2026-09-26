import { FeesType, type ServiceDetail } from "../../../types/service.types";
import { Link } from "react-router-dom";

export type ServiceDetailContentProps = {
  service: ServiceDetail;
};

export function ServiceDetailContent({ service }: ServiceDetailContentProps) {
  const feeLabel =
    service.feesType === FeesType.FREE
      ? "Free"
      : service.feesType === FeesType.SPECIFIED
        ? (service.feesText ?? "Fees are specified by the authority")
        : "Check the official guidance";
  return (
    <article aria-labelledby="service-title" className="space-y-8">
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-strong"
      >
        <span aria-hidden="true">←</span>
        All services
      </Link>

      <header className="relative overflow-hidden rounded-card border border-brand/10 bg-linear-to-br from-brand-soft via-surface to-accent-soft p-6 shadow-card sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-brand via-accent to-highlight"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full bg-surface/80 px-3 py-1 text-sm font-semibold text-accent shadow-sm">
            {service.jurisdiction.name}
          </span>

          <div
            aria-hidden="true"
            className="mt-5 h-1 w-16 rounded-full bg-highlight"
          />

          <h1
            id="service-title"
            className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl"
          >
            {service.name}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {service.description}
          </p>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line/80 bg-surface/75 p-4 backdrop-blur-sm">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                Fees
              </dt>
              <dd className="mt-1 font-semibold text-ink">{feeLabel}</dd>
            </div>

            <div className="rounded-lg border border-line/80 bg-surface/75 p-4 backdrop-blur-sm">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                Processing time
              </dt>
              <dd className="mt-1 font-semibold text-ink">
                {service.processingTime ?? "Not specified"}
              </dd>
            </div>
          </dl>
        </div>
      </header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-8">
          <section
            aria-labelledby="eligibility-heading"
            className="rounded-card border border-line bg-surface p-6 shadow-sm"
          >
            <h2
              id="eligibility-heading"
              className="text-xl font-bold tracking-tight text-ink"
            >
              Who is eligible
            </h2>

            <p className="mt-3 leading-7 text-muted">{service.eligibility}</p>
          </section>

          <section
            aria-labelledby="steps-heading"
            className="rounded-card border border-line bg-surface p-6 shadow-sm"
          >
            <h2
              id="steps-heading"
              className="text-xl font-bold tracking-tight text-ink"
            >
              How to apply
            </h2>

            {service.steps.length > 0 ? (
              <ol className="mt-5 space-y-4">
                {service.steps.map((step) => (
                  <li key={step.id} className="flex gap-4 items-center">
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
                    >
                      {step.order}
                    </span>

                    <div className="min-w-0 flex-1 rounded-lg border border-line bg-canvas/60 px-4 py-3">
                      <p className="leading-7 text-ink">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 leading-7 text-muted">
                Application steps are not currently available.
              </p>
            )}
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-6">
          <section
            aria-labelledby="documents-heading"
            className="rounded-card border border-line bg-surface p-6 shadow-sm"
          >
            <h2
              id="documents-heading"
              className="text-xl font-bold tracking-tight text-ink"
            >
              Required documents
            </h2>

            {service.requiredDocuments.length > 0 ? (
              <ul className="mt-4 divide-y divide-line">
                {service.requiredDocuments.map((document) => (
                  <li key={document.id} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-semibold text-ink">
                      {document.description}
                    </p>

                    {document.example && (
                      <p className="mt-1 text-sm leading-6 text-muted">
                        Example: {document.example}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 leading-7 text-muted">
                No required documents are currently listed.
              </p>
            )}
          </section>

          <section
            aria-labelledby="resources-heading"
            className="rounded-card border border-line bg-surface p-6 shadow-sm"
          >
            <h2
              id="resources-heading"
              className="text-lg font-bold tracking-tight text-ink"
            >
              Official resources
            </h2>

            <div className="mt-4 grid gap-3">
              <a
                href={service.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                Open official portal
                <span aria-hidden="true">↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>

              <a
                href={service.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:border-brand/30 hover:bg-brand-soft"
              >
                View information source
                <span aria-hidden="true">↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </section>
        </aside>
      </div>
    </article>
  );
}
