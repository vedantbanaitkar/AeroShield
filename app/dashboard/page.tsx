'use client'
import { motion } from 'framer-motion'
import { useWallet } from '@txnlab/use-wallet-react'
import {
  Shield, TrendingUp, Clock, CheckCircle2,
  Plane, ExternalLink, AlertCircle, Zap, BarChart3,
  ArrowUpRight, Calendar, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as any },
})

/* ── Static mock data (shows the product vision) ── */
const mockPolicies = [
  {
    id: 'AS-48291',
    flight: 'AI302',
    route: 'BOM → DEL',
    date: 'Apr 15, 2026',
    coverage: 10,
    premium: 0.5,
    status: 'active',
    delayMinutes: null,
  },
  {
    id: 'AS-48103',
    flight: '6E204',
    route: 'DEL → BLR',
    date: 'Apr 10, 2026',
    coverage: 25,
    premium: 1.25,
    status: 'paid',
    delayMinutes: 145,
  },
  {
    id: 'AS-47891',
    flight: 'UK812',
    route: 'BLR → HYD',
    date: 'Apr 3, 2026',
    coverage: 5,
    premium: 0.25,
    status: 'expired',
    delayMinutes: 40,
  },
]

const mockActivity = [
  { type: 'payout',   text: 'Received 25 ALGO payout',   subtext: 'Flight 6E204 · 145 min delay',  time: '4 days ago',  color: 'emerald' },
  { type: 'policy',   text: 'Policy AI302 activated',     subtext: 'Coverage: 10 ALGO',             time: '1 day ago',   color: 'cyan'    },
  { type: 'oracle',   text: 'Oracle check completed',     subtext: 'No delay detected · UK812',     time: '11 days ago', color: 'violet'  },
  { type: 'expired',  text: 'Policy UK812 expired',       subtext: 'Flight landed on time',         time: '11 days ago', color: 'zinc'    },
]

const statsData = [
  { label: 'Total Coverage',  value: '40 ALGO',  sub: 'Across 3 policies',     icon: Shield,     color: 'cyan'    },
  { label: 'Total Payouts',   value: '25 ALGO',  sub: '1 claim triggered',      icon: Zap,        color: 'emerald' },
  { label: 'Total Premiums',  value: '2 ALGO',   sub: 'Paid this month',        icon: TrendingUp, color: 'violet'  },
  { label: 'Avg Settlement',  value: '2.3s',     sub: 'vs 3-6 weeks traditional', icon: Clock,   color: 'amber'   },
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return (
    <div className="flex items-center gap-1.5">
      <div className="status-dot w-1.5 h-1.5" />
      <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-xs">Active</Badge>
    </div>
  )
  if (status === 'paid') return (
    <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 text-xs">Paid Out</Badge>
  )
  return (
    <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-xs">Expired</Badge>
  )
}

export default function DashboardPage() {
  const { activeAccount, wallets } = useWallet()

  if (!activeAccount) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <motion.div {...fadeUp()} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Connect to view dashboard</h2>
          <p className="text-zinc-400 text-sm mb-6">Your policies, payouts, and activity — all on-chain.</p>
          <Button
            onClick={() => wallets?.find(w => w.id === 'walletconnect')?.connect() ?? wallets?.[0]?.connect()}
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2"
          >
            <Zap className="w-4 h-4" />
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div {...fadeUp()} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1 font-mono">
              {activeAccount.address.slice(0, 10)}...{activeAccount.address.slice(-6)}
            </p>
          </div>
          <Link href="/app">
            <Button className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2">
              <Shield className="w-4 h-4" />
              New Policy
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp(i * 0.08)} className="glass rounded-2xl p-5">
              <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${
                stat.color === 'cyan'    ? 'bg-cyan-400/10 border border-cyan-400/20' :
                stat.color === 'emerald' ? 'bg-emerald-400/10 border border-emerald-400/20' :
                stat.color === 'violet'  ? 'bg-violet-400/10 border border-violet-400/20' :
                'bg-amber-400/10 border border-amber-400/20'
              }`}>
                <stat.icon className={`w-4 h-4 ${
                  stat.color === 'cyan'    ? 'text-cyan-400' :
                  stat.color === 'emerald' ? 'text-emerald-400' :
                  stat.color === 'violet'  ? 'text-violet-400' :
                  'text-amber-400'
                }`} />
              </div>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
              <p className="text-xs text-zinc-600 mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Policies table */}
          <div className="md:col-span-2">
            <motion.div {...fadeUp(0.2)} className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Your policies</h2>
                <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">{mockPolicies.length} total</Badge>
              </div>
              <div className="divide-y divide-white/5">
                {mockPolicies.map((policy, i) => (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="p-5 hover:bg-white/2 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          policy.status === 'active'  ? 'bg-emerald-400/10 border border-emerald-400/20' :
                          policy.status === 'paid'    ? 'bg-cyan-400/10 border border-cyan-400/20' :
                          'bg-zinc-800 border border-zinc-700'
                        }`}>
                          <Plane className={`w-4 h-4 ${
                            policy.status === 'active'  ? 'text-emerald-400' :
                            policy.status === 'paid'    ? 'text-cyan-400' :
                            'text-zinc-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-white">{policy.flight}</span>
                            <span className="text-zinc-600 text-xs">·</span>
                            <span className="text-zinc-500 text-xs">{policy.route}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3 h-3 text-zinc-600" />
                            <span className="text-xs text-zinc-600">{policy.date}</span>
                            <span className="text-zinc-700 text-xs">·</span>
                            <span className="text-xs text-zinc-600">{policy.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-white">{policy.coverage} ALGO</p>
                        {policy.status === 'paid' && policy.delayMinutes && (
                          <p className="text-xs text-emerald-400 mt-0.5">{policy.delayMinutes}m delay</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <StatusBadge status={policy.status} />
                      <button className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        View on-chain
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Activity feed */}
          <div className="space-y-4">
            <motion.div {...fadeUp(0.3)} className="glass rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h2 className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Activity</h2>
              </div>
              <div className="p-4 space-y-1">
                {mockActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.color === 'emerald' ? 'bg-emerald-400/10' :
                      item.color === 'cyan'    ? 'bg-cyan-400/10' :
                      item.color === 'violet'  ? 'bg-violet-400/10' :
                      'bg-zinc-800'
                    }`}>
                      {item.type === 'payout'  && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                      {item.type === 'policy'  && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
                      {item.type === 'oracle'  && <Activity className="w-3.5 h-3.5 text-violet-400" />}
                      {item.type === 'expired' && <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300">{item.text}</p>
                      <p className="text-xs text-zinc-600 truncate">{item.subtext}</p>
                    </div>
                    <span className="text-[10px] text-zinc-700 flex-shrink-0">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Analytics teaser */}
            <motion.div {...fadeUp(0.4)} className="glass rounded-2xl p-5 border border-violet-400/10">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                <p className="text-sm font-medium text-zinc-300">Analytics</p>
                <Badge className="bg-violet-400/10 text-violet-400 border-violet-400/20 text-[10px] ml-auto">Soon</Badge>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Historical payout rates, route delay heatmaps, and portfolio analytics coming in v2.
              </p>
              <button className="mt-3 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                Join waitlist <ArrowUpRight className="w-3 h-3" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

