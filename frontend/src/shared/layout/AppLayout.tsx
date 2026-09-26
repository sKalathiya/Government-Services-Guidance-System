import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { AppFooter } from "./AppFooter";
import useAuthenticatedUser from "../../features/auth/hooks/useAuthenticatedUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../../api/auth";
import { getAuthKey } from "../../features/auth/queries/auth.queryKeys";

export function AppLayout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isPending } = useAuthenticatedUser();

  const { mutate } = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(getAuthKey(), null);
      navigate("/");
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-page flex-col items-start gap-4 px-4 py-4 sm:min-h-16 sm:flex-row sm:items-center sm:px-6 sm:py-0 lg:px-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-brand hover:text-brand-strong"
          >
            GovGuide
          </Link>
          <nav
            aria-label="Primary navigation"
            className="flex w-full flex-wrap gap-1 justify-between items-center"
          >
            <div>
              {!data && (
                <NavLink to="/" end className={navigationClass}>
                  Home
                </NavLink>
              )}

              <NavLink to="/services" className={navigationClass}>
                Services
              </NavLink>
            </div>

            <>
              {isPending ? null : data ? (
                <div className="ml-1 flex max-w-full  items-center gap-2 rounded-full border border-line bg-canvas py-1 pr-1 pl-1">
                  <span
                    className="hover:cursor-pointer flex items-center gap-2"
                    onClick={() => navigate("/profile")}
                    role="button"
                    tabIndex={0}
                    aria-label="Profile"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white"
                    >
                      {profileInitial(data.name, data.email)}
                    </span>

                    <span className="block min-w-0 leading-tight max-w-36 truncate text-sm font-semibold text-ink">
                      {data.name}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => mutate()}
                    className="ml-1 inline-flex hover:cursor-pointer min-h-8 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft hover:text-brand-strong"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div>
                  <NavLink to="/login" className={navigationClass}>
                    Login
                  </NavLink>

                  <NavLink to="/register" className={navigationClass}>
                    Register
                  </NavLink>
                </div>
              )}
            </>
          </nav>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-page flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

function profileInitial(name: string, email: string) {
  const source = name.trim() || email.trim();
  return source.charAt(0).toUpperCase();
}

function navigationClass({ isActive }: { isActive: boolean }) {
  const baseClasses =
    "rounded-md px-3 py-2 text-sm font-medium transition-colors";
  return isActive
    ? `${baseClasses} bg-brand-soft text-brand`
    : `${baseClasses} text-muted hover:bg-brand-soft hover:text-ink`;
}
