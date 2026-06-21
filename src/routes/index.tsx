import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero3D } from "@/components/landing/Hero3D";
import { ZoomPortal } from "@/components/landing/ZoomPortal";
import { Marquee } from "@/components/landing/Marquee";
import { About } from "@/components/landing/About";
import { ExplodedSkills } from "@/components/landing/ExplodedSkills";
import { ExperienceTimeline } from "@/components/landing/ExperienceTimeline";
import { ProjectsHorizontal } from "@/components/landing/ProjectsHorizontal";
import { Education } from "@/components/landing/Education";
import { Contact } from "@/components/landing/Contact";
import { MagneticCursor } from "@/components/landing/MagneticCursor";
import { GrainOverlay } from "@/components/landing/GrainOverlay";
import { Scanlines } from "@/components/landing/Scanlines";
import { Preloader } from "@/components/landing/Preloader";
import { MagneticBinder } from "@/components/landing/MagneticButton";
import { AmbientAudio } from "@/components/landing/AmbientAudio";
import { Toaster } from "@/components/ui/sonner";

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
      <Preloader />
      <GrainOverlay />
      <Scanlines />
      <MagneticCursor />
      <MagneticBinder />
      <AmbientAudio />
      <Toaster />
      <Nav />
      <Hero3D />
      <ZoomPortal />
      <Marquee />
      <About />
      <ExplodedSkills />
      <ExperienceTimeline />
      <ProjectsHorizontal />
      <Education />
      <Contact />
    </main>
  );
}
