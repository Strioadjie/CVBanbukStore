"use client";

import Link from "next/link";

const logos = ["ANTHROPIC", "coinbase", "Microsoft", "perplexity", "HubSpot", "Notion", "PayPal", "Lovable"];

export default function HomeExperience() {
  return (
    <div className="mint-page">
      <section className="content-wrap landing-hero text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/75">
          <span className="rounded bg-[color:var(--brand-green)] px-1.5 py-0.5 text-[10px] font-bold text-black">NEW</span>
          Workflow-first product knowledge management
        </div>
        <h1 className="mx-auto mt-8 max-w-4xl text-[clamp(42px,8vw,72px)] font-semibold leading-[1.05] tracking-normal text-white">
          The Intelligent Knowledge Platform
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[18px] leading-7 text-white/68">
          Helping teams create and maintain a world-class product catalog built for both humans and AI.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="mint-pill mint-pill-green">
            Start now
          </Link>
          <Link href="/products" className="mint-pill mint-pill-outline">
            Explore store
          </Link>
        </div>

        <div className="mint-card-dark landing-preview mx-auto mt-14 max-w-5xl overflow-hidden text-left">
          <div className="grid border-b border-white/10 text-[13px] text-white/54 md:grid-cols-[220px_1fr_200px]">
            <div className="border-white/10 p-5 md:border-r">
              <div className="mb-5 flex items-center gap-2 text-white">
                <span className="h-3 w-3 rounded-full bg-[color:var(--brand-green)]" />
                BanbukStore
              </div>
              {["Quickstart", "Global Settings", "AI optimizations", "Components", "Themes"].map((item, index) => (
                <div key={item} className={`rounded-md px-3 py-2 ${index === 0 ? "bg-[rgba(0,212,164,0.12)] text-[color:var(--brand-green)]" : ""}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className="p-6">
              <div className="mb-5 flex gap-5 overflow-x-auto border-b border-white/10 pb-4 text-[13px]">
                <span className="text-[color:var(--brand-green)]">Guides</span>
                <span>API Reference</span>
                <span>Changelog</span>
              </div>
              <p className="text-[13px] uppercase tracking-[0.5px] text-[color:var(--brand-green)]">Getting started</p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-normal text-white">Quickstart Guide</h2>
              <p className="mt-2 text-[14px] text-white/52">Start building intelligent documentation in under five minutes.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {["Quickstart", "Installation", "Web editor", "Components"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-[rgba(0,212,164,0.08)] p-5">
                    <div className="mb-5 h-9 w-9 rounded-lg bg-[rgba(0,212,164,0.18)]" />
                    <h3 className="font-semibold text-white">{item}</h3>
                    <p className="mt-2 text-[13px] text-white/50">Clean workflows that keep your team and catalog aligned.</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden border-l border-white/10 p-5 text-[13px] md:block">
              <p className="mb-4 text-white">On this page</p>
              <p className="text-[color:var(--brand-green)]">Introduction</p>
              <p className="mt-3 text-white/45">Getting started</p>
              <p className="mt-3 text-white/45">AI workflows</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 text-[15px] font-semibold text-white/64 sm:grid-cols-4">
          {logos.map((logo) => (
            <div key={logo}>{logo}</div>
          ))}
        </div>
      </section>

      <section className="content-wrap py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-[clamp(36px,6vw,56px)] font-semibold leading-[1.1] tracking-normal text-white">
          Built for the intelligence age
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/58">
          Integrate AI into every part of your product workflow. When you know your catalog is written, maintained, and understood by both users and AI.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[
            ["Built for both people and AI", "Ensure your product shows up in the AI workflows users already rely on."],
            ["Self-updating knowledge management", "Draft, edit, and maintain content with a context-aware agent."],
          ].map(([title, copy]) => (
            <div key={title} className="mint-card-dark p-8 text-left">
              <p className="section-kicker">Agent</p>
              <h3 className="mt-2 text-[24px] font-semibold tracking-normal text-white">{title}</h3>
              <p className="mt-3 text-white/56">{copy}</p>
              <div className="mt-10 h-36 rounded-xl border border-white/10 bg-[rgba(0,212,164,0.08)]" />
            </div>
          ))}
        </div>
      </section>

      <section data-nav-surface="solid" className="landing-solid-section bg-[#151816] py-24 text-white">
        <div className="content-wrap">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">Enterprise workflows</p>
              <h2 className="mt-3 max-w-xl text-[42px] font-semibold leading-[1.1] tracking-normal">
                Bring intelligence to enterprise knowledge
              </h2>
              <p className="mt-4 max-w-xl text-white/58">Modernize without the rebuild with enterprise-grade controls and security.</p>
            </div>
            <Link href="/products" className="mint-pill mint-pill-light">
              Explore store
            </Link>
          </div>
          <div className="mt-12 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#0d3e43,#f0a642)] p-8 md:p-12">
            <p className="text-sm font-semibold text-white/70">Customer story</p>
            <h3 className="mt-2 max-w-lg text-[28px] font-semibold tracking-normal">See how Banbuk accelerates product operations with intelligent commerce.</h3>
            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-[34px] font-semibold tracking-normal">2M+</p>
                <p className="text-sm text-white/70">Monthly catalog views</p>
              </div>
              <div>
                <p className="text-[34px] font-semibold tracking-normal">3+</p>
                <p className="text-sm text-white/70">Checkout paths unified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-nav-surface="solid" className="content-wrap py-24 text-center">
        <h2 className="text-[42px] font-semibold leading-[1.1] tracking-normal text-white">
          Make product knowledge your winning advantage
        </h2>
        <p className="mt-3 text-white/56">Join the teams building cleaner product journeys.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="mint-pill mint-pill-light">Get started for free</Link>
          <Link href="/products" className="mint-pill mint-pill-outline">Get a demo</Link>
        </div>
      </section>

      <footer data-nav-surface="solid" className="border-t border-white/10 py-16 text-white/54">
        <div className="content-wrap grid gap-8 md:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <span className="h-4 w-4 rounded-full bg-[color:var(--brand-green)]" />
              BanbukStore
            </Link>
            <p className="mt-8 text-sm">AI automation powered. © 2026 Banbuk.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
            {["Explore", "Resources", "Documentation", "Company"].map((group) => (
              <div key={group}>
                <p className="mb-3 text-white">{group}</p>
                <Link href="/products" className="block py-1">Store</Link>
                <Link href="/login" className="block py-1">Sign in</Link>
                <Link href="/register" className="block py-1">Start</Link>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
