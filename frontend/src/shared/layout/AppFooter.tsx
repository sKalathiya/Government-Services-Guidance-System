import { Link } from "react-router-dom";
import useAuthenticatedUser from "../../features/auth/hooks/useAuthenticatedUser";

const publicSitemapLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Login", to: "/login" },
  { label: "Create account", to: "/register" },
] as const;

const signedInSitemapLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
] as const;

export function AppFooter() {
  const { data, isPending } = useAuthenticatedUser();
  const sitemapLinks = isPending || data ? signedInSitemapLinks : publicSitemapLinks;
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-12 border-t border-white/10 bg-ink text-white sm:mt-16">
      <div className="mx-auto w-full max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr]">
          <section aria-labelledby="footer-about-heading">
            <h2
              id="footer-about-heading"
              className="text-xl font-bold tracking-tight"
            >
              GovGuide
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
              Clear, practical guidance that helps people understand
              government-service eligibility, documents, fees, and application
              steps.
            </p>
          </section>

          <nav aria-labelledby="footer-sitemap-heading">
            <h2
              id="footer-sitemap-heading"
              className="text-sm font-semibold uppercase tracking-wider text-white/60"
            >
              Sitemap
            </h2>

            <ul className="mt-4 space-y-3">
              {sitemapLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-heading">
            <h2
              id="footer-contact-heading"
              className="text-sm font-semibold uppercase tracking-wider text-white/60"
            >
              Contact
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/70">
              Questions about GovGuide or feedback about this website?
            </p>

            {supportEmail ? (
              <a
                href={`mailto:${supportEmail}`}
                className="mt-3 inline-flex text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
              >
                {supportEmail}
              </a>
            ) : (
              <p className="mt-3 text-sm font-medium text-white/85">
                Contact details will be available before public launch.
              </p>
            )}
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-white/60 sm:flex-row sm:items-start sm:justify-between">
          <p>© {currentYear} GovGuide</p>
          <p className="max-w-xl sm:text-right">
            GovGuide provides informational guidance. Applications and final
            decisions remain with the relevant government authority.
          </p>
        </div>
      </div>
    </footer>
  );
}
