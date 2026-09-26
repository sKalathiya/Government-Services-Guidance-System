const PLACEHOLDER_COUNT = 4;

export function ServiceResultsSkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading services"
      className="space-y-4 motion-safe:animate-pulse"
    >
      <div className="space-y-2" aria-hidden="true">
        <div className="h-7 w-48 rounded bg-line" />
        <div className="h-4 w-28 rounded bg-line" />
      </div>

      <ul
        aria-hidden="true"
        className="grid list-none gap-4 p-0 md:grid-cols-2"
      >
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <li
            key={index}
            className="rounded-card border border-line bg-surface p-5 shadow-sm"
          >
            <div className="h-6 w-24 rounded-full bg-accent-soft" />
            <div className="mt-4 h-6 w-3/4 rounded bg-line" />
            <div className="mt-3 h-4 w-full rounded bg-line" />
            <div className="mt-2 h-4 w-5/6 rounded bg-line" />
            <div className="mt-6 h-4 w-28 rounded bg-brand-soft" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Loading services</span>
    </section>
  );
}
