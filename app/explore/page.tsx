'use client'
import { motion } from 'framer-motion'
import {
  Plane, CloudRain, Ship, Wheat, Thermometer,
  Zap, ArrowRight, CheckCircle2, Lock, Globe, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as any },
})

const products = [
  {
    icon: Plane,
    title: 'Flight Delay',
    category: 'Travel',
    desc: 'Automatic payout when your flight departure delay exceeds a threshold you set — 1, 2, or 4 hours.',
    trigger: 'Departure delay ≥ threshold',
    dataSource: 'AviationStack API',
    oracle: 'Centralized (MVP) → Goracle (v2)',
    coverage: '1–500 ALGO',
    premium: '5% of coverage',
    settlement: '< 3 seconds',
    status: 'live',
    features: ['Global flight coverage', 'Configurable threshold', 'Instant wallet payout', 'On-chain verifiable'],
    color: 'cyan',
    gradient: 'from-cyan-400/10 to-blue-500/5',
    border: 'border-cyan-400/20',
  },
  {
    icon: CloudRain,
    title: 'Crop Weather',
    category: 'Agriculture',
    desc: 'Protects farmers when seasonal rainfall index drops below agreed strike levels, triggering automatic compensation.',
    trigger: 'Rainfall index < strike value',
    dataSource: 'OpenWeatherMap + IMD',
    oracle: 'Goracle Network',
    coverage: '100–10,000 ALGO',
    premium: '3–8% of coverage',
    settlement: 'Daily settlement cycle',
    status: 'soon',
    features: ['District-level precision', 'IMD data integration', 'Seasonal policies', 'Multi-crop support'],
    color: 'emerald',
    gradient: 'from-emerald-400/10 to-green-500/5',
    border: 'border-emerald-400/20',
  },
  {
    icon: Ship,
    title: 'Cargo & Freight',
    category: 'Logistics',
    desc: 'Port delay and shipping disruption coverage for exporters and importers. Triggered by AIS vessel tracking data.',
    trigger: 'Port dwell time > threshold',
    dataSource: 'MarineTraffic AIS',
    oracle: 'Goracle Network',
    coverage: '500–100,000 ALGO',
    premium: '2–4% of coverage',
    settlement: '< 1 minute',
    status: 'soon',
    features: ['AIS vessel tracking', 'Port-specific policies', 'B2B contracts', 'Multi-leg coverage'],
    color: 'violet',
    gradient: 'from-violet-400/10 to-purple-500/5',
    border: 'border-violet-400/20',
  },
  {
    icon: Wheat,
    title: 'Commodity Price',
    category: 'Finance',
    desc: 'Revenue protection when commodity spot prices deviate from an agreed strike price — for producers and buyers.',
    trigger: 'Spot price < strike price',
    dataSource: 'Chainlink Price Feeds',
    oracle: 'Goracle + Chainlink',
    coverage: '1,000–500,000 ALGO',
    premium: '1–3% of coverage',
    settlement: 'On price update',
    status: 'soon',
    features: ['Multiple commodities', 'Strike price config', 'Hedging support', 'DeFi composable'],
    color: 'amber',
    gradient: 'from-amber-400/10 to-yellow-500/5',
    border: 'border-amber-400/20',
  },
  {
    icon: Thermometer,
    title: 'Temperature Event',
    category: 'Energy',
    desc: 'Energy cost protection when temperatures hit extremes, driving up heating or cooling costs beyond normal range.',
    trigger: 'Temp deviation > threshold',
    dataSource: 'OpenWeatherMap',
    oracle: 'Goracle Network',
    coverage: '50–5,000 ALGO',
    premium: '4–7% of coverage',
    settlement: 'Daily settlement',
    status: 'soon',
    features: ['City-level granularity', 'Heating & cooling', 'B2C and B2B', 'Seasonal pricing'],
    color: 'coral',
    gradient: 'from-red-400/10 to-orange-500/5',
    border: 'border-red-400/20',
  },
]

const colorMap: Record<string, string> = {
  cyan:   'text-cyan-400',
  emerald:'text-emerald-400',
  violet: 'text-violet-400',
  amber:  'text-amber-400',
  coral:  'text-red-400',
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div {...fadeUp()} className="text-center mb-16">
          <Badge className="bg-violet-400/10 text-violet-400 border-violet-400/20 mb-4">Product Suite</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            One protocol,{' '}
            <span className="text-gradient">infinite triggers.</span>
          </h1>
          <p className="text-slate-700 max-w-2xl mx-auto text-lg leading-relaxed">
            AeroShield is not just flight insurance. It's a parametric insurance infrastructure layer —
            any real-world data point can become a trigger. Here's what we're building.
          </p>
        </motion.div>

        {/* Product cards */}
        <div className="space-y-6">
          {products.map((product, i) => (
            <motion.div
              key={product.title}
              {...fadeUp(i * 0.08)}
              className={`glass rounded-2xl overflow-hidden border ${product.border} group hover:border-opacity-40 transition-all`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
              <div className="relative p-6 sm:p-8">
                <div className="grid md:grid-cols-3 gap-8">

                  {/* Left: main info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.gradient} border ${product.border} flex items-center justify-center flex-shrink-0`}>
                        <product.icon className={`w-6 h-6 ${colorMap[product.color]}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>{product.title}</h2>
                          <Badge variant="secondary" className="text-slate-700 border-zinc-500 text-xs font-medium">{product.category}</Badge>
                          {product.status === 'live' ? (
                            <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-xs">
                              Live on Testnet
                            </Badge>
                          ) : (
                            <Badge className="bg-zinc-800 text-slate-200 border-zinc-600 text-xs font-medium">Coming Soon</Badge>
                          )}
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{product.desc}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2">
                      {product.features.map(feature => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${colorMap[product.color]}`} />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: specs */}
                  <div className="glass rounded-xl p-5 space-y-3 self-start">
                    <p className="text-xs uppercase tracking-widest text-slate-700 font-medium mb-3">Policy specs</p>
                    {[
                      { icon: Zap,    label: 'Trigger',     value: product.trigger },
                      { icon: Globe,  label: 'Data source', value: product.dataSource },
                      { icon: Lock,   label: 'Oracle',      value: product.oracle },
                      { icon: Shield, label: 'Coverage',    value: product.coverage },
                    ].map(spec => (
                      <div key={spec.label} className="flex items-start gap-2.5">
                        <spec.icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${colorMap[product.color]}`} />
                        <div>
                          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">{spec.label}</p>
                          <p className="text-xs text-slate-600">{spec.value}</p>
                        </div>
                      </div>
                    ))}

                    {product.status === 'live' ? (
                      <Link href="/app" className="block mt-4">
                        <Button size="sm" className={`w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2`}>
                          <Zap className="w-3.5 h-3.5" />
                          Get Insured
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full mt-4 border-white/10 text-slate-700 gap-2" disabled>
                        Notify me when live
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA — build on top */}
        <motion.div {...fadeUp(0.3)} className="mt-16 glass rounded-2xl p-10 text-center border border-violet-400/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/5 to-transparent" />
          <div className="relative">
            <Badge className="bg-violet-400/10 text-violet-400 border-violet-400/20 mb-4">For Developers</Badge>
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
              Build your own parametric product
            </h2>
            <p className="text-slate-700 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
              AeroShield exposes a composable smart contract API. Plug in any oracle data source,
              set your own trigger logic, and launch a parametric insurance product in days — not months.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/docs">
                <Button className="bg-violet-500 hover:bg-violet-400 text-white font-bold gap-2">
                  Read the docs
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" className="border-white/10 text-slate-700 hover:text-slate-900 gap-2">
                <Globe className="w-4 h-4" />
                View on GitHub
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

