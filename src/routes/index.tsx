import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { About } from "@/components/landing/About";
import { Skills } from "@/components/landing/Skills";
import { ExperienceTimeline } from "@/components/landing/ExperienceTimeline";
import { Education } from "@/components/landing/Education";
import { Contact } from "@/components/landing/Contact";
import { MagneticCursor } from "@/components/landing/MagneticCursor";
import { GrainOverlay } from "@/components/landing/GrainOverlay";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Jiyul Ahn — Developer & Systems Architect" },
      {
        name: "description",
        content:
          "Jiyul Ahn — systems-oriented developer, founder, and DX Tech PM. Building B2B export infrastructure and digitized operational platforms.",
      },
      { property: "og:title", content: "Jiyul Ahn — Developer & Systems Architect" },
      {
        property: "og:description",
        content:
          "Portfolio of Jiyul Ahn — developer, founder, and Stony Brook CS undergrad building production-grade systems.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="relative bg-background text-foreground">
      <GrainOverlay />
      <MagneticCursor />
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Skills />
      <ExperienceTimeline />
      <Education />
      <Contact />
    </main>
  );
}
