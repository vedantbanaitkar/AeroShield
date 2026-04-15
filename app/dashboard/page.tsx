'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@txnlab/use-wallet-react'
import {
  Shield, TrendingUp, Clock,
  Plane, ExternalLink, Zap, BarChart3,
  ArrowUpRight, Calendar, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  computePolicyStatus,
  getPolicyStorageKey,
  getPolicyStorageUpdatedEventName,
  policyRepository,
  type PolicyRecord,
} from '@/lib/policies'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as any },
})

type DashboardStatus = 'active' | 'paid'

type DashboardActivity = {
  type: 'payout' | 'policy' | 'oracle'
  text: string
  subtext: string
  time: string
  color: 'emerald' | 'cyan' | 'violet'
}

const DEMO_POLICIES: PolicyRecord[] = [
  {
    id: 'demo_policy_active',
    walletAddress: 'DEMO',
    productId: 'flight',
    productLabel: 'Flight Delay',
    flightNumber: 'AI302',
    routeFrom: 'BOM',
    routeTo: 'DEL',
    delayThreshold: 120,
    coverage: 10,
    premium: 0.5,
    appId: Number(process.env.NEXT_PUBLIC_APP_ID ?? 0),
    premiumPaymentTxId: 'DEMO_PREMIUM_TX',
    appCallTxId: 'DEMO_BUY_TX',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    lastOracleCheckAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    delayMinutes: 75,
  },
  {
    id: 'demo_policy_paid',
    walletAddress: 'DEMO',
    productId: 'flight',
    productLabel: 'Flight Delay',
    flightNumber: '6E204',
    routeFrom: 'DEL',
    routeTo: 'BLR',
    delayThreshold: 120,
    coverage: 25,
    premium: 1.25,
    appId: Number(process.env.NEXT_PUBLIC_APP_ID ?? 0),
    premiumPaymentTxId: 'DEMO_PREMIUM_TX_2',
    appCallTxId: 'DEMO_BUY_TX_2',
    payoutTxId: 'DEMO_PAYOUT_TX',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    payoutTriggeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastOracleCheckAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    delayMinutes: 145,
  },
]

function formatAgo(isoDate: string) {
  const ms = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.max(1, Math.floor(ms / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatDateLabel(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getPolicyRoute(policy: PolicyRecord) {
  if (policy.routeFrom && policy.routeTo) {
    return `${policy.routeFrom} → ${policy.routeTo}`
  }

  if (policy.productId === 'flight') {
    return 'Flight coverage'
  }

  if (policy.region) {
    return policy.region
  }

  return policy.productLabel
}

function getExplorerTx(policy: PolicyRecord) {
  return policy.payoutTxId ?? policy.appCallTxId ?? policy.premiumPaymentTxId
}

function buildActivityItems(policies: PolicyRecord[]): DashboardActivity[] {
  const rows: DashboardActivity[] = []

  for (const policy of policies) {
    const status = computePolicyStatus(policy)
    if (status === 'paid' && policy.payoutTxId) {
      rows.push({
        type: 'payout',
        text: `Received ${policy.coverage} ALGO payout`,
        subtext: `${policy.productLabel} · ${policy.delayMinutes ?? 0} min trigger`,
        time: formatAgo(policy.payoutTriggeredAt ?? policy.updatedAt),
        color: 'emerald',
      })
    }

    rows.push({
      type: 'policy',
      text: `${policy.productLabel} policy activated`,
      subtext: `Coverage: ${policy.coverage} ALGO`,
      time: formatAgo(policy.createdAt),
      color: 'cyan',
    })

    if (policy.lastOracleCheckAt) {
      rows.push({
        type: 'oracle',
        text: 'Oracle check completed',
        subtext: `${policy.flightNumber} · ${policy.delayMinutes ?? 0} min`,
        time: formatAgo(policy.lastOracleCheckAt),
        color: 'violet',
      })
    }
  }

  return rows.slice(0, 8)
}

function StatusBadge({ status }: { status: DashboardStatus }) {
  if (status === 'active') return (
    <div className="flex items-center gap-1.5">
      <div className="status-dot w-1.5 h-1.5" />
      <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-xs">Active</Badge>
    </div>
  )

  return (
    <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 text-xs">Paid Out</Badge>
  )
}

export default function DashboardPage() {
  const { activeAccount, wallets } = useWallet()
  const connectMode = process.env.NEXT_PUBLIC_CONNECT_MODE ?? 'pera-first'
  const [policies, setPolicies] = useState<PolicyRecord[]>([])
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false)

  function isConnectCancelledError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return /modal is closed by user|cancelled|canceled|rejected|proposal expired|session expired/i.test(message.toLowerCase())
  }

  async function tryConnect(walletId: string): Promise<'connected' | 'cancelled' | 'failed'> {
    const wallet = wallets?.find(w => w.id === walletId)
    if (!wallet) return 'failed'

    try {
      await wallet.connect()
      return 'connected'
    } catch (error) {
      if (isConnectCancelledError(error)) {
        return 'cancelled'
      }

      console.error(`Failed to connect with ${walletId}:`, error)
      return 'failed'
    }
  }

  async function handleConnect() {
    const preferredOrder =
      connectMode === 'walletconnect-first'
        ? ['walletconnect', 'pera', 'defly']
        : ['pera', 'defly', 'walletconnect']

    for (const walletId of preferredOrder) {
      const result = await tryConnect(walletId)
      if (result === 'connected') {
        return
      }
      if (result === 'cancelled') {
        return
      }
    }

    const fallback = wallets?.[0]
    if (!fallback) return
    await tryConnect(fallback.id)
  }

  useEffect(() => {
    if (!activeAccount) {
      setPolicies([])
      return
    }

    let isCancelled = false

    const loadPolicies = async () => {
      setIsLoadingPolicies(true)
      const records = await policyRepository.listByWallet(activeAccount.address)
      if (!isCancelled) {
        setPolicies(records)
        setIsLoadingPolicies(false)
      }
    }

    loadPolicies()

    const refreshOnStorage = (event: StorageEvent) => {
      if (event.key === getPolicyStorageKey()) {
        void loadPolicies()
      }
    }

    const refreshOnSameTabWrite = () => {
      void loadPolicies()
    }

    window.addEventListener('storage', refreshOnStorage)
    window.addEventListener(getPolicyStorageUpdatedEventName(), refreshOnSameTabWrite)

    return () => {
      isCancelled = true
      window.removeEventListener('storage', refreshOnStorage)
      window.removeEventListener(getPolicyStorageUpdatedEventName(), refreshOnSameTabWrite)
    }
  }, [activeAccount])

  const isUsingDemoData = !isLoadingPolicies && policies.length === 0
  const displayedPolicies = isUsingDemoData ? DEMO_POLICIES : policies

  const totalCoverage = useMemo(() => displayedPolicies.reduce((sum, policy) => sum + policy.coverage, 0), [displayedPolicies])
  const totalPayouts = useMemo(
    () => displayedPolicies.filter(policy => computePolicyStatus(policy) === 'paid').reduce((sum, policy) => sum + policy.coverage, 0),
    [displayedPolicies]
  )
  const totalPremiums = useMemo(() => displayedPolicies.reduce((sum, policy) => sum + policy.premium, 0), [displayedPolicies])
  const paidPolicies = useMemo(() => displayedPolicies.filter(policy => computePolicyStatus(policy) === 'paid'), [displayedPolicies])
  const avgSettlement = useMemo(() => {
    if (!paidPolicies.length) return '--'

    const durations = paidPolicies
      .map(policy => {
        if (!policy.payoutTriggeredAt) return null
        const start = new Date(policy.createdAt).getTime()
        const end = new Date(policy.payoutTriggeredAt).getTime()
        const seconds = (end - start) / 1000
        return Number.isFinite(seconds) && seconds > 0 ? seconds : null
      })
      .filter((value): value is number => value !== null)

    if (!durations.length) return '--'

    const average = durations.reduce((sum, value) => sum + value, 0) / durations.length
    return `${average.toFixed(1)}s`
  }, [paidPolicies])

  const statsData = useMemo(
    () => [
      { label: 'Total Coverage', value: `${totalCoverage} ALGO`, sub: `Across ${displayedPolicies.length} policies`, icon: Shield, color: 'cyan' as const },
      { label: 'Total Payouts', value: `${totalPayouts} ALGO`, sub: `${paidPolicies.length} claim${paidPolicies.length === 1 ? '' : 's'} triggered`, icon: Zap, color: 'emerald' as const },
      { label: 'Total Premiums', value: `${totalPremiums.toFixed(2)} ALGO`, sub: 'Paid from wallet on buy', icon: TrendingUp, color: 'violet' as const },
      { label: 'Avg Settlement', value: avgSettlement, sub: 'Measured from buy to payout tx', icon: Clock, color: 'amber' as const },
    ],
    [avgSettlement, displayedPolicies.length, paidPolicies.length, totalCoverage, totalPayouts, totalPremiums]
  )

  const activityItems = useMemo(() => buildActivityItems(displayedPolicies), [displayedPolicies])

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
            onClick={handleConnect}
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
              <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
              <p className="text-xs text-zinc-300 mt-0.5 font-medium">{stat.label}</p>
              <p className="text-xs text-zinc-400 mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Policies table */}
          <div className="md:col-span-2">
            <motion.div {...fadeUp(0.2)} className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Your policies</h2>
                <div className="flex items-center gap-2">
                  {isUsingDemoData && (
                    <Badge className="bg-violet-400/10 text-violet-400 border-violet-400/20 text-xs">Demo data</Badge>
                  )}
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs font-medium">{displayedPolicies.length} total</Badge>
                </div>
              </div>
              {!displayedPolicies.length && (
                <div className="p-6 text-sm text-zinc-400">
                  {isLoadingPolicies ? 'Loading policies...' : 'No policies found yet. Buy one from the app page to see live status here.'}
                </div>
              )}
              <div className="divide-y divide-white/5">
                {displayedPolicies.map((policy, i) => {
                  const status = computePolicyStatus(policy)
                  const route = getPolicyRoute(policy)
                  const explorerTx = isUsingDemoData ? undefined : getExplorerTx(policy)

                  return (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="p-5 hover:bg-white/2 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          status === 'active' ? 'bg-emerald-400/10 border border-emerald-400/20' :
                          'bg-cyan-400/10 border border-cyan-400/20'
                        }`}>
                          <Plane className={`w-4 h-4 ${
                            status === 'active' ? 'text-emerald-400' : 'text-cyan-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900">{policy.flightNumber}</span>
                            <span className="text-zinc-500 text-xs">·</span>
                            <span className="text-zinc-300 text-xs">{route}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3 h-3 text-zinc-600" />
                            <span className="text-xs text-zinc-400">{formatDateLabel(policy.createdAt)}</span>
                            <span className="text-zinc-500 text-xs">·</span>
                            <span className="text-xs text-zinc-400">{policy.id.slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">{policy.coverage} ALGO</p>
                        {status === 'paid' && policy.delayMinutes !== undefined && (
                          <p className="text-xs text-emerald-400 mt-0.5">{policy.delayMinutes}m delay</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <StatusBadge status={status} />
                      {explorerTx ? (
                        <a
                          href={`https://testnet.explorer.perawallet.app/tx/${explorerTx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-400 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on-chain
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-500">Pending tx link</span>
                      )}
                    </div>
                  </motion.div>
                )})}
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
                {!activityItems.length && (
                  <p className="text-xs text-zinc-400 px-3 py-2">No activity yet. Policy events will appear here after a buy.</p>
                )}
                {activityItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.color === 'emerald' ? 'bg-emerald-400/10' :
                      item.color === 'cyan'    ? 'bg-cyan-400/10' :
                      'bg-violet-400/10'
                    }`}>
                      {item.type === 'payout'  && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                      {item.type === 'policy'  && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
                      {item.type === 'oracle'  && <Activity className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300">{item.text}</p>
                      <p className="text-xs text-zinc-400 truncate">{item.subtext}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">{item.time}</span>
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
              <p className="text-xs text-zinc-400 leading-relaxed">
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

