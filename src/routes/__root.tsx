import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { themeBootScript } from "@/lib/theme";

function NotFoundComponent() {
  return (
    <main className="mx-auto max-w-[40rem] px-6 py-24">
      <h1 className="text-[2rem] font-medium leading-none">Not here</h1>
      <p className="mt-4 text-soft">That page doesn't exist, or it used to and doesn't anymore.</p>
      <p className="mt-6">
        <a href="/" className="underline">
          Back to the front page
        </a>
      </p>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <main className="mx-auto max-w-[40rem] px-6 py-24">
      <h1 className="text-[2rem] font-medium leading-none">Something broke</h1>
      <p className="mt-4 text-soft">This one is on my side. Reloading usually does it.</p>
      <p className="mt-6 flex gap-6">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="underline"
        >
          Try again
        </button>
        <a href="/" className="underline">
          Back to the front page
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
      { title: "Jiyul Ahn" },
      { name: "description", content: "Jiyul Ahn · developer in Songdo, Incheon." },
      { name: "author", content: "Jiyul Ahn" },
      { property: "og:title", content: "Jiyul Ahn" },
      { property: "og:description", content: "Developer in Songdo, Incheon." },
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
  return (
    <html lang="en" suppressHydrationWarning>
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
