import { createFileRoute } from "@tanstack/react-router";

import { Home } from "@/components/site/Home";
import { headFor } from "@/lib/head";

export const Route = createFileRoute("/ko")({
  component: () => <Home lang="ko" />,
  head: () => headFor("ko"),
});
