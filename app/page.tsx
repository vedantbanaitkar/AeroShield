'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import {
  Shield, Zap, Globe, ArrowRight, CheckCircle2,
  Clock, FileX, TrendingUp, ChevronRight, Star,
  Plane, CloudRain, Ship, Wheat, Lock, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ─── tiny animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
})

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

/* ─── data ─── */
const stats = [
  { value: '< 3s',   label: 'Settlement time' },
  { value: '0',      label: 'Claims to file' },
  { value: '100%',   label: 'On-chain transparent' },
  { value: '$0',     label: 'Hidden fees' },
]

const steps = [
  {
    number: '01',
    icon: Shield,
    title: 'Buy a policy',
    desc: 'Connect your Algorand wallet, enter your flight number and choose coverage. Pay a small premium — that\'s it.',
    color: 'from-cyan-400/20 to-blue-500/10',
    border: 'border-cyan-400/20',
    iconColor: 'text-cyan-400',
  },
  {
    number: '02',
    icon: Activity,
    title: 'Oracle monitors',
    desc: 'Our decentralized oracle network continuously monitors real-time flight data and feeds it to your smart contract.',
    color: 'from-violet-400/20 to-purple-500/10',
    border: 'border-violet-400/20',
    iconColor: 'text-violet-400',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Instant auto-payout',
    desc: 'The moment your flight exceeds the delay threshold, the contract atomically transfers ALGO directly to your wallet.',
    color: 'from-emerald-400/20 to-green-500/10',
    border: 'border-emerald-400/20',
    iconColor: 'text-emerald-400',
  },
]

const problems = [
  { icon: Clock,   label: 'Weeks of waiting',   old: true  },
  { icon: FileX,   label: 'Endless paperwork',  old: true  },
  { icon: Shield,  label: 'Human gatekeepers',  old: true  },
  { icon: Zap,     label: 'Instant settlement', old: false },
  { icon: Lock,    label: 'Zero trust needed',  old: false },
  { icon: Globe,   label: 'Fully transparent',  old: false },
]

const products = [
  {
    icon: Plane,
    title: 'Flight Delay',
    desc: 'Triggered by departure delay exceeding threshold.',
    status: 'live',
    statusLabel: 'Live on Testnet',
    color: 'cyan',
  },
  {
    icon: CloudRain,
    title: 'Crop Weather',
    desc: 'Rainfall index drops below seasonal average.',
    status: 'soon',
    statusLabel: 'Coming Soon',
    color: 'emerald',
  },
  {
    icon: Ship,
    title: 'Cargo & Freight',
    desc: 'Port delays and shipping route disruptions.',
    status: 'soon',
    statusLabel: 'Coming Soon',
    color: 'violet',
  },
  {
    icon: Wheat,
    title: 'Commodity Price',
    desc: 'Spot price deviates from agreed strike price.',
    status: 'soon',
    statusLabel: 'Coming Soon',
    color: 'amber',
  },
]

const testimonials = [
  {
    quote: 'My flight was delayed 3 hours. Before I even landed, AeroShield had already sent ALGO to my wallet. This is the future of insurance.',
    author: 'Arjun M.',
    role: 'Early Tester',
    stars: 5,
  },
  {
    quote: 'The traditional claim process took me 6 weeks last year. AeroShield settled in under a minute. No contest.',
    author: 'Priya S.',
    role: 'Frequent Flyer',
    stars: 5,
  },
  {
    quote: 'As someone who builds on Algorand, seeing parametric insurance done right on-chain is incredibly exciting.',
    author: 'Devraj K.',
    role: 'Algorand Developer',
    stars: 5,
  },
]

/* ─── Policy card (floating hero element) ─── */
function PolicyCard() {
  return (
    <motion.div
      className="float relative w-full max-w-sm mx-auto"
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-cyan-400/10 rounded-3xl blur-2xl scale-110" />

      {/* Card */}
      <div className="relative glass border-gradient rounded-2xl overflow-hidden p-6">
        {/* Scan line animation */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="scan-line" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Insurance Policy</p>
            <p className="font-mono text-xs text-zinc-400">#AS-{Math.floor(Math.random() * 90000 + 10000)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="status-dot" />
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
        </div>

        {/* Flight info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-white">BOM</p>
            <p className="text-xs text-zinc-500 mt-0.5">Mumbai</p>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1 px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-700" />
            <Plane className="w-4 h-4 text-cyan-400 rotate-90" />
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-700 to-transparent" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-white">DEL</p>
            <p className="text-xs text-zinc-500 mt-0.5">Delhi</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Flight', value: 'AI-302' },
            { label: 'Date', value: '15 Apr 2026' },
            { label: 'Coverage', value: '10 ALGO' },
            { label: 'Threshold', value: '2 hr delay' },
          ].map(item => (
            <div key={item.label} className="bg-white/3 rounded-lg p-2.5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-medium text-white mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-black" />
            </div>
            <span className="text-xs text-zinc-400">Algorand TestNet</span>
          </div>
          <p className="text-xs text-zinc-600 font-mono">0x3a4f...8c21</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Page ─── */
export default function HomePage() {
  return (
    <div className="relative overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background grid */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <motion.div {...fadeIn(0.1)} className="flex items-center gap-2 mb-6">
              <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 px-3 py-1 text-xs">
                🚀 Built on Algorand · AlgoBharat Hack 3.0
              </Badge>
            </motion.div>

            <motion.h1
              {...fadeUp(0.15)}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Insurance that{' '}
              <span className="text-gradient">pays itself.</span>
            </motion.h1>

            <motion.p {...fadeUp(0.25)} className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-lg">
              Parametric flight delay insurance powered by Algorand smart contracts.
              No claims, no adjusters, no waiting — your payout hits your wallet
              the instant your flight crosses the delay threshold.
            </motion.p>

            <motion.div {...fadeUp(0.35)} className="flex flex-wrap gap-3 mb-12">
              <Link href="/app">
                <Button size="lg" className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2 glow-cyan px-6">
                  <Zap className="w-4 h-4" />
                  Get Insured Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-zinc-300 gap-2 px-6">
                  How it works
                </Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div {...fadeIn(0.5)} className="flex flex-wrap items-center gap-6">
              {[
                { icon: Shield, label: 'Non-custodial' },
                { icon: Lock,   label: 'Smart contract secured' },
                { icon: Globe,  label: 'Fully transparent' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-zinc-500 text-sm">
                  <item.icon className="w-4 h-4 text-cyan-400/60" />
                  {item.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — policy card */}
          <div className="lg:flex justify-center hidden">
            <PolicyCard />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} {...fadeIn(i * 0.1)} className="text-center">
                <p className="text-3xl font-bold text-gradient-subtle" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {stat.value}
                </p>
                <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem vs Solution ── */}
      <section className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <Badge className="bg-red-400/10 text-red-400 border-red-400/20 mb-4">The Problem</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Traditional insurance is broken.
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              You pay premiums for years, then fight to get paid when something goes wrong.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Old way */}
            <motion.div {...fadeUp(0.1)} className="glass rounded-2xl p-6 border-red-400/10">
              <p className="text-xs uppercase tracking-widest text-red-400 mb-4">Traditional Insurance</p>
              <div className="space-y-3">
                {problems.filter(p => p.old).map(item => (
                  <div key={item.label} className="flex items-center gap-3 text-zinc-400">
                    <div className="w-6 h-6 rounded-full bg-red-400/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-sm line-through opacity-60">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* New way */}
            <motion.div {...fadeUp(0.2)} className="glass rounded-2xl p-6 border-cyan-400/10 glow-cyan">
              <p className="text-xs uppercase tracking-widest text-cyan-400 mb-4">AeroShield</p>
              <div className="space-y-3">
                {problems.filter(p => !p.old).map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3 h-3 text-cyan-400" />
                    </div>
                    <span className="text-sm text-white">{item.label}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-28 relative">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <Badge className="bg-violet-400/10 text-violet-400 border-violet-400/20 mb-4">How it works</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Three steps to{' '}
              <span className="text-gradient">zero-friction</span> coverage.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-cyan-400/20 via-violet-400/20 to-emerald-400/20 hidden md:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                {...fadeUp(i * 0.15)}
                className={`glass glass-hover rounded-2xl p-8 border ${step.border} relative group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center`}>
                      <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                    </div>
                    <span className="text-4xl font-bold text-white/5" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products / Coming soon ── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 mb-4">Product Suite</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              One protocol,{' '}
              <span className="text-gradient">infinite triggers.</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Any real-world data point can become an insurance trigger.
              We're starting with flight delay — and expanding fast.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.title}
                {...fadeUp(i * 0.1)}
                className="glass glass-hover rounded-2xl p-6 group relative overflow-hidden"
              >
                {product.status === 'live' && (
                  <div className="absolute inset-0 bg-cyan-400/3 rounded-2xl" />
                )}
                <div className="relative">
                  <product.icon className={`w-8 h-8 mb-4 ${
                    product.color === 'cyan' ? 'text-cyan-400' :
                    product.color === 'emerald' ? 'text-emerald-400' :
                    product.color === 'violet' ? 'text-violet-400' :
                    'text-amber-400'
                  }`} />
                  <h3 className="font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {product.title}
                  </h3>
                  <p className="text-zinc-500 text-sm mb-4 leading-relaxed">{product.desc}</p>
                  <Badge className={
                    product.status === 'live'
                      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-xs'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700 text-xs'
                  }>
                    {product.statusLabel}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Early testers love it.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.author} {...fadeUp(i * 0.1)} className="glass rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-white text-sm">{t.author}</p>
                  <p className="text-zinc-500 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[300px] bg-cyan-400/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp()}>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Your next delayed flight{' '}
              <span className="text-gradient">pays you back.</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10">
              Connect your Algorand wallet and get covered in under 60 seconds.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/app">
                <Button size="lg" className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2 glow-cyan px-8 py-6 text-base">
                  <Zap className="w-5 h-5" />
                  Get Insured Now
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-zinc-300 px-8 py-6 text-base gap-2">
                  Explore Products
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { title: 'Product', links: ['Get Insured', 'Dashboard', 'Explore', 'Pricing'] },
              { title: 'Developers', links: ['Documentation', 'Smart Contract', 'Oracle API', 'GitHub'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Disclosures', 'Security'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-md flex items-center justify-center">
                <Shield className="w-3 h-3 text-black" />
              </div>
              <span className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                Aero<span className="text-cyan-400">Shield</span>
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              © 2026 AeroShield · Built by Team Chain Reaction · AlgoBharat Hack Series 3.0
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <div className="status-dot w-1.5 h-1.5" />
              Algorand TestNet
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
