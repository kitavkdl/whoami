import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { themeBootScript } from "@/lib/theme";
import { getCopy } from "@/lib/copy";
import { HOME_PATH, HTML_LANG, langFromLocation } from "@/lib/i18n";

/** The language of whatever is being rendered, taken from the URL. */
function useRouteLang() {
  const location = useRouterState({ select: (state) => state.location });
  return langFromLocation(location.pathname, location.search as Record<string, unknown>);
}

function NotFoundComponent() {
  const lang = useRouteLang();
  const copy = getCopy(lang);

  return (
    <main className="mx-auto max-w-[40rem] px-6 py-24">
      <h1 className="text-[2rem] font-medium leading-none">{copy.notFound.title}</h1>
      <p className="mt-4 text-soft">{copy.notFound.body}</p>
      <p className="mt-6">
        <a href={HOME_PATH[lang]} className="underline">
          {copy.notFound.back}
        </a>
      </p>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const lang = useRouteLang();
  const copy = getCopy(lang);

  return (
    <main className="mx-auto max-w-[40rem] px-6 py-24">
      <h1 className="text-[2rem] font-medium leading-none">{copy.error.title}</h1>
      <p className="mt-4 text-soft">{copy.error.body}</p>
      <p className="mt-6 flex gap-6">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="underline"
        >
          {copy.error.retry}
        </button>
        <a href={HOME_PATH[lang]} className="underline">
          {copy.error.back}
        </a>
      </p>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Jiyul Ahn" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  // Read off the URL rather than hardcoded, so the Korean page is served as
  // Korean to crawlers and to a screen reader picking a voice.
  const lang = useRouteLang();

  return (
    <html lang={HTML_LANG[lang]} suppressHydrationWarning>
      <head>
        {/*
          Resolves the theme and marks the document as scripted before the
          first paint, so there is no flash and no reveal animation runs on a
          browser that would never finish it.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
