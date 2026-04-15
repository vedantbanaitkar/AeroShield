"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileX,
  ChevronLeft,
  ChevronRight,
  Star,
  Plane,
  CloudRain,
  Ship,
  Wheat,
  Lock,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const stats = [
  { value: "< 3s", label: "Settlement time" },
  { value: "0", label: "Claims to file" },
  { value: "100%", label: "On-chain transparent" },
  { value: "$0", label: "Hidden fees" },
];

const steps = [
  {
    number: "01",
    icon: Shield,
    title: "Buy a policy",
    desc: "Connect your Algorand wallet, enter your flight number and choose coverage. Pay a small premium — that's it.",
    color: "from-sky-200 to-cyan-100",
    border: "border-stone-200",
    iconColor: "text-sky-700",
  },
  {
    number: "02",
    icon: Activity,
    title: "Oracle monitors",
    desc: "Our decentralized oracle network continuously monitors real-time flight data and feeds it to your smart contract.",
    color: "from-violet-100 to-fuchsia-50",
    border: "border-stone-200",
    iconColor: "text-violet-700",
  },
  {
    number: "03",
    icon: Zap,
    title: "Instant auto-payout",
    desc: "The moment your flight exceeds the delay threshold, the contract atomically transfers ALGO directly to your wallet.",
    color: "from-emerald-100 to-lime-50",
    border: "border-stone-200",
    iconColor: "text-emerald-700",
  },
];

const problems = [
  { icon: Clock, label: "Weeks of waiting", old: true },
  { icon: FileX, label: "Endless paperwork", old: true },
  { icon: Shield, label: "Human gatekeepers", old: true },
  { icon: Zap, label: "Instant settlement", old: false },
  { icon: Lock, label: "Zero trust needed", old: false },
  { icon: Globe, label: "Fully transparent", old: false },
];

const products = [
  {
    icon: Plane,
    title: "Flight Delay",
    desc: "Triggered by departure delay exceeding threshold.",
    status: "live",
    statusLabel: "Live on Testnet",
    color: "cyan",
  },
  {
    icon: CloudRain,
    title: "Crop Weather",
    desc: "Rainfall index drops below seasonal average.",
    status: "soon",
    statusLabel: "Coming Soon",
    color: "emerald",
  },
  {
    icon: Ship,
    title: "Cargo & Freight",
    desc: "Port delays and shipping route disruptions.",
    status: "soon",
    statusLabel: "Coming Soon",
    color: "violet",
  },
  {
    icon: Wheat,
    title: "Commodity Price",
    desc: "Spot price deviates from agreed strike price.",
    status: "soon",
    statusLabel: "Coming Soon",
    color: "amber",
  },
];

const testimonials = [
  {
    quote:
      "My flight was delayed 3 hours. Before I even landed, AeroShield had already sent ALGO to my wallet. This is the future of insurance.",
    author: "Arjun M.",
    role: "Early Tester",
    stars: 5,
  },
  {
    quote:
      "The traditional claim process took me 6 weeks last year. AeroShield settled in under a minute. No contest.",
    author: "Priya S.",
    role: "Frequent Flyer",
    stars: 5,
  },
  {
    quote:
      "As someone who builds on Algorand, seeing parametric insurance done right on-chain is incredibly exciting.",
    author: "Devraj K.",
    role: "Algorand Developer",
    stars: 5,
  },
];

const heroPolicies = [
  {
    policyNo: "#AS-48291",
    status: "Active",
    fromCode: "BOM",
    fromCity: "Mumbai",
    toCode: "DEL",
    toCity: "Delhi",
    flight: "AI-302",
    date: "15 Apr 2026",
    coverage: "10 ALGO",
    threshold: "2 hr delay",
    wallet: "0x3a4f...8c21",
  },
  {
    policyNo: "#AS-49507",
    status: "Active",
    fromCode: "BLR",
    fromCity: "Bengaluru",
    toCode: "HYD",
    toCity: "Hyderabad",
    flight: "6E-741",
    date: "19 Apr 2026",
    coverage: "25 ALGO",
    threshold: "90 min delay",
    wallet: "0x98bc...114a",
  },
  {
    policyNo: "#AS-50338",
    status: "Active",
    fromCode: "MAA",
    fromCity: "Chennai",
    toCode: "CCU",
    toCity: "Kolkata",
    flight: "SG-517",
    date: "22 Apr 2026",
    coverage: "15 ALGO",
    threshold: "3 hr delay",
    wallet: "0xbe26...ca09",
  },
];

function PolicyCard() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const bounded = Math.max(0, Math.min(heroPolicies.length - 1, index));
    container.scrollTo({
      left: container.clientWidth * bounded,
      behavior: "smooth",
    });
    setActiveIndex(bounded);
  };

  const onScrollCards = () => {
    const container = scrollRef.current;
    if (!container) return;
    const next = Math.round(container.scrollLeft / container.clientWidth);
    if (next !== activeIndex) {
      setActiveIndex(next);
    }
  };

  return (
    <motion.div
      className="float relative mx-auto w-full max-w-sm"
      initial={{ opacity: 0, scale: 0.94, rotateY: -8 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.2,
        ease: [0.22, 1, 0.36, 1] as any,
      }}
    >
      <div className="absolute inset-0 rounded-3xl bg-sky-200/35 blur-2xl scale-110" />
      <div className="relative glass border-gradient overflow-hidden rounded-2xl p-6 text-stone-800 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="scan-line" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
            Live Policies
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white/70 text-stone-600 transition hover:border-stone-400 hover:text-stone-800"
              aria-label="Previous policy"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white/70 text-stone-600 transition hover:border-stone-400 hover:text-stone-800"
              aria-label="Next policy"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScrollCards}
          className="scrollbar-card-row -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2"
        >
          {heroPolicies.map((policy) => (
            <div key={policy.policyNo} className="min-w-full snap-center">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.28em] text-stone-500">
                    Insurance Policy
                  </p>
                  <p className="font-mono text-xs text-stone-500">
                    {policy.policyNo}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="status-dot" />
                  <span className="text-xs font-medium text-emerald-700">
                    {policy.status}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div className="text-center">
                  <p className="font-mono text-2xl font-bold text-stone-900">
                    {policy.fromCode}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {policy.fromCity}
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center gap-1 px-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-300" />
                  <Plane className="h-4 w-4 rotate-90 text-sky-700" />
                  <div className="h-px flex-1 bg-gradient-to-r from-stone-300 to-transparent" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl font-bold text-stone-900">
                    {policy.toCode}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {policy.toCity}
                  </p>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                {[
                  { label: "Flight", value: policy.flight },
                  { label: "Date", value: policy.date },
                  { label: "Coverage", value: policy.coverage },
                  { label: "Threshold", value: policy.threshold },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-stone-200 bg-stone-50 p-2.5"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-stone-500">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-stone-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs text-stone-600">
                    Algorand TestNet
                  </span>
                </div>
                <p className="font-mono text-xs text-stone-500">
                  {policy.wallet}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5">
          {heroPolicies.map((policy, index) => (
            <button
              key={policy.policyNo}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to policy ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index
                  ? "w-5 bg-sky-600"
                  : "w-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>

        <div className="mt-2 text-center text-[11px] text-stone-500">
          Swipe or use arrows to explore active policies
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative flex min-h-screen items-center pt-16">
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-35" />
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-sky-200/25 blur-[120px]" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.div
              {...fadeIn(0.1)}
              className="mb-6 flex items-center gap-2"
            >
              <Badge className="border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                Built on Algorand · AlgoBharat Hack 3.0
              </Badge>
            </motion.div>

            <motion.h1
              {...fadeUp(0.15)}
              className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl"
            >
              Insurance that <span className="text-gradient">pays itself.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.25)}
              className="mb-8 max-w-lg text-lg leading-relaxed text-stone-600"
            >
              Parametric flight delay insurance powered by Algorand smart
              contracts. No claims, no adjusters, no waiting. Your payout hits
              your wallet the instant your flight crosses the delay threshold.
            </motion.p>

            <motion.div
              {...fadeUp(0.35)}
              className="mb-12 flex flex-wrap gap-3"
            >
              <Link href="/app">
                <Button
                  size="lg"
                  className="gap-2 bg-slate-900 px-6 font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)] hover:bg-slate-800"
                >
                  <Zap className="h-4 w-4" />
                  Get Insured Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-stone-300 px-6 text-stone-700 hover:bg-stone-100"
                >
                  How it works
                </Button>
              </Link>
            </motion.div>

            <motion.div
              {...fadeIn(0.5)}
              className="flex flex-wrap items-center gap-6"
            >
              {[
                { icon: Shield, label: "Non-custodial" },
                { icon: Lock, label: "Smart contract secured" },
                { icon: Globe, label: "Fully transparent" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-sm text-stone-500"
                >
                  <item.icon className="h-4 w-4 text-sky-600/70" />
                  {item.label}
                </div>
              ))}
            </motion.div>
          </div>

          <div className="hidden justify-center lg:flex">
            <PolicyCard />
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeIn(i * 0.1)}
                className="text-center"
              >
                <p className="text-3xl font-bold text-stone-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div {...fadeUp()} className="mb-16 text-center">
            <Badge className="mb-4 border-red-200 bg-red-50 text-red-700">
              The Problem
            </Badge>
            <h2 className="mb-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              Traditional insurance is broken.
            </h2>
            <p className="mx-auto max-w-xl text-lg text-stone-600">
              You pay premiums for years, then fight to get paid when something
              goes wrong.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <p className="mb-4 text-xs uppercase tracking-[0.28em] text-stone-500">
                Traditional Insurance
              </p>
              <div className="space-y-3">
                {problems
                  .filter((p) => p.old)
                  .map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 text-stone-500"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 flex-shrink-0">
                        <item.icon className="h-3 w-3 text-red-600" />
                      </div>
                      <span className="text-sm line-through opacity-60">
                        {item.label}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp(0.2)}
              className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-[0_0_0_1px_rgba(125,211,252,0.15)]"
            >
              <p className="mb-4 text-xs uppercase tracking-[0.28em] text-sky-700">
                AeroShield
              </p>
              <div className="space-y-3">
                {problems
                  .filter((p) => !p.old)
                  .map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 flex-shrink-0">
                        <item.icon className="h-3 w-3 text-sky-700" />
                      </div>
                      <span className="text-sm text-stone-800">
                        {item.label}
                      </span>
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-600" />
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-28">
        <div className="dot-pattern pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div {...fadeUp()} className="mb-16 text-center">
            <Badge className="mb-4 border-violet-200 bg-violet-50 text-violet-700">
              How it works
            </Badge>
            <h2 className="text-4xl font-bold text-stone-900 sm:text-5xl">
              Three steps to{" "}
              <span className="text-gradient">zero-friction</span> coverage.
            </h2>
          </motion.div>

          <div className="relative grid gap-6 md:grid-cols-3">
            <div className="absolute left-1/4 right-1/4 top-12 hidden h-px bg-gradient-to-r from-sky-200 via-violet-200 to-emerald-200 md:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                {...fadeUp(i * 0.15)}
                className={`glass glass-hover relative overflow-hidden rounded-2xl border ${step.border} p-8`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-70`}
                />
                <div className="relative">
                  <div className="mb-6 flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border ${step.border} bg-white shadow-sm`}
                    >
                      <step.icon className={`h-5 w-5 ${step.iconColor}`} />
                    </div>
                    <span className="text-4xl font-bold text-stone-200">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-stone-900">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div {...fadeUp()} className="mb-16 text-center">
            <Badge className="mb-4 border-amber-200 bg-amber-50 text-amber-700">
              Product Suite
            </Badge>
            <h2 className="mb-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              One protocol,{" "}
              <span className="text-gradient">infinite triggers.</span>
            </h2>
            <p className="mx-auto max-w-xl text-stone-600">
              Any real-world data point can become an insurance trigger.
              We&apos;re starting with flight delay and expanding fast.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <motion.div
                key={product.title}
                {...fadeUp(i * 0.1)}
                className="glass glass-hover relative overflow-hidden rounded-2xl border border-stone-200 p-6"
              >
                {product.status === "live" && (
                  <div className="absolute inset-0 rounded-2xl bg-sky-100/40" />
                )}
                <div className="relative">
                  <product.icon
                    className={`mb-4 h-8 w-8 ${
                      product.color === "cyan"
                        ? "text-sky-700"
                        : product.color === "emerald"
                          ? "text-emerald-700"
                          : product.color === "violet"
                            ? "text-violet-700"
                            : "text-amber-700"
                    }`}
                  />
                  <h3 className="mb-2 font-bold text-stone-900">
                    {product.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-stone-600">
                    {product.desc}
                  </p>
                  <Badge
                    className={
                      product.status === "live"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 text-xs"
                        : "border-stone-200 bg-stone-100 text-stone-500 text-xs"
                    }
                  >
                    {product.statusLabel}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white/70 py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div {...fadeUp()} className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-stone-900">
              Early testers love it.
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                {...fadeUp(i * 0.1)}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-0.5">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-stone-600">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {t.author}
                  </p>
                  <p className="text-xs text-stone-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[300px] w-[500px] rounded-full bg-sky-200/30 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div {...fadeUp()}>
            <h2 className="mb-6 text-5xl font-bold text-stone-900 sm:text-6xl">
              Your next delayed flight{" "}
              <span className="text-gradient">pays you back.</span>
            </h2>
            <p className="mb-10 text-lg text-stone-600">
              Connect your Algorand wallet and get covered in under 60 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/app">
                <Button
                  size="lg"
                  className="gap-2 bg-slate-900 px-8 py-6 text-base font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)] hover:bg-slate-800"
                >
                  <Zap className="h-5 w-5" />
                  Get Insured Now
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-stone-300 px-8 py-6 text-base text-stone-700 hover:bg-stone-100"
                >
                  Explore Products
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              {
                title: "Product",
                links: ["Get Insured", "Dashboard", "Explore", "Pricing"],
              },
              {
                title: "Developers",
                links: [
                  "Documentation",
                  "Smart Contract",
                  "Oracle API",
                  "GitHub",
                ],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Disclosures", "Security"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-xs uppercase tracking-[0.28em] text-stone-500">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-stone-500 transition-colors hover:text-stone-900"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-cyan-400">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-bold text-stone-900">
                Aero<span className="text-sky-700">Shield</span>
              </span>
            </div>
            <p className="text-xs text-stone-500">
              © 2026 AeroShield · Built by Team Chain Reaction · AlgoBharat Hack
              Series 3.0
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <div className="status-dot h-1.5 w-1.5" />
              Algorand TestNet
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
