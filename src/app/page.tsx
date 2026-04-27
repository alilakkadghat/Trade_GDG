import Link from "next/link";
import { Suspense, lazy } from "react";
import SignalTicker from "@/components/landing/SignalTicker";

const Globe = lazy(() => import("@/components/landing/Globe"));

export default function LandingPage() {
  return (
    <main className="landing-theme relative min-h-screen overflow-hidden bg-[hsl(160_45%_5%)] text-[hsl(150_30%_92%)]">
      {/* Globe background */}
      <div className="absolute inset-0 landing-animate-fade-in-slow">
        <Suspense fallback={<div className="h-full w-full bg-[hsl(160_45%_5%)]" />}>
          <Globe />
        </Suspense>
      </div>

      {/* Vignette + grain overlay */}
      <div className="pointer-events-none absolute inset-0 landing-bg-vignette" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(hsl(150 80% 60% / 0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Top brand mark */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <div
          className="flex items-center gap-2 landing-animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(150_75%_45%)] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[hsl(150_75%_45%)] landing-shadow-glow" />
          </span>
          <span className="font-[Space_Grotesk,ui-sans-serif,system-ui,sans-serif] text-sm font-semibold tracking-[0.2em] text-[hsl(150_30%_92%/0.9)]">
            TRADEBOT
          </span>
        </div>
        <div
          className="hidden font-mono text-[10px] tracking-widest text-[hsl(150_15%_60%)] sm:block landing-animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          LIVE · GLOBAL TRADE NET
        </div>
      </header>

      {/* Hero content */}
      <section className="relative z-10 flex min-h-[calc(100vh-160px)] flex-col items-center justify-center px-6 text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(155_30%_15%/0.6)] bg-[hsl(160_45%_5%/0.4)] px-4 py-1.5 backdrop-blur-md landing-animate-fade-up"
          style={{ animationDelay: "700ms" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(145_85%_60%)] landing-shadow-glow" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[hsl(150_15%_60%)]">
            India-first trade intelligence
          </span>
        </div>

        <h1
          className="max-w-4xl font-[Space_Grotesk,ui-sans-serif,system-ui,sans-serif] text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl landing-animate-fade-up"
          style={{ animationDelay: "900ms" }}
        >
          The world's trade, <span className="landing-text-gradient">always on.</span>
        </h1>

        <p
          className="mt-6 max-w-xl text-base leading-relaxed text-[hsl(150_15%_60%)] sm:text-lg landing-animate-fade-up"
          style={{ animationDelay: "1100ms" }}
        >
          Live shipment signals across Mumbai, Dubai, Singapore, Hamburg and every major port —
          streamed to one calm gateway.
        </p>

        <div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4 landing-animate-fade-up"
          style={{ animationDelay: "1300ms" }}
        >
          <Link
            href="/login"
            className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full bg-[hsl(150_75%_45%)] px-8 font-medium text-[hsl(160_50%_6%)] landing-shadow-glow transition-all hover:scale-[1.03] hover:bg-[hsl(150_75%_45%/0.9)]"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full border border-[hsl(155_30%_15%/0.6)] bg-[hsl(160_45%_5%/0.3)] px-8 font-medium text-[hsl(150_30%_92%)] backdrop-blur-md transition-all hover:bg-[hsl(160_45%_5%/0.6)]"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Live signal ticker */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 landing-animate-slide-up"
        style={{ animationDelay: "1700ms" }}
      >
        <SignalTicker />
      </div>
    </main>
  );
}
