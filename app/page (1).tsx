'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@txnlab/use-wallet-react'
import {
  Shield, Zap, Plane, CheckCircle2, Loader2,
  AlertCircle, ExternalLink, ArrowRight, Info, Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import algosdk from 'algosdk'

const APP_ID = Number(process.env.NEXT_PUBLIC_APP_ID ?? 0)

type FlowStep = 'form' | 'confirm' | 'signing' | 'monitoring' | 'checking' | 'paying' | 'done' | 'error'

interface Policy {
  flightNumber: string
  coverage: number
  premium: number
  walletAddress: string
  txId?: string
  delayMinutes?: number
  payoutTxId?: string
}

const COVERAGE_OPTIONS = [5, 10, 25, 50, 100]

export default function AppPage() {
  const { activeAccount, wallets, signTransactions, sendTransactions } = useWallet()
  const [step, setStep] = useState<FlowStep>('form')
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [flightNumber, setFlightNumber] = useState('AI302')
  const [coverage, setCoverage] = useState(10)
  const [errorMsg, setErrorMsg] = useState('')
  const [mockDelay, setMockDelay] = useState(false)

  const premium = +(coverage * 0.05).toFixed(2)

  function handleConnect() {
    wallets?.find(w => w.id === 'walletconnect')?.connect()
      ?? wallets?.[0]?.connect()
  }

  async function handleBuyPolicy() {
    if (!activeAccount) return
    setStep('signing')
    setErrorMsg('')

    try {
      const algodClient = new algosdk.Algodv2(
        process.env.NEXT_PUBLIC_ALGOD_TOKEN ?? '',
        process.env.NEXT_PUBLIC_ALGOD_SERVER ?? 'https://testnet-api.algonode.cloud',
        Number(process.env.NEXT_PUBLIC_ALGOD_PORT ?? 443)
      )
      const sp = await algodClient.getTransactionParams().do()
      const premiumMicroAlgo = Math.round(premium * 1_000_000)
      const appAddress = algosdk.getApplicationAddress(APP_ID)

      const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAccount.address,
        receiver: APP_ID > 0 ? appAddress : activeAccount.address,
        amount: premiumMicroAlgo,
        suggestedParams: sp,
        note: new TextEncoder().encode(`AeroShield:${flightNumber}`),
      })

      const encoded = [payTxn.toByte()]
      const signed = await signTransactions(encoded)
      const { id } = await sendTransactions(signed)

      const newPolicy: Policy = {
        flightNumber,
        coverage,
        premium,
        walletAddress: activeAccount.address,
        txId: id,
      }
      setPolicy(newPolicy)
      setStep('monitoring')
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Transaction failed')
      setStep('error')
    }
  }

  async function handleCheckFlight() {
    if (!policy) return
    setStep('checking')

    try {
      const url = `/api/oracle?flight=${policy.flightNumber}${mockDelay ? '&mock=true' : ''}`
      const res = await fetch(url)
      const data = await res.json()

      setPolicy(prev => ({ ...prev!, delayMinutes: data.delayMinutes }))

      if (data.isEligible) {
        setStep('paying')
        await triggerPayout(data.delayMinutes)
      } else {
        setStep('monitoring')
      }
    } catch (e: any) {
      setErrorMsg(e.message)
      setStep('error')
    }
  }

  async function triggerPayout(delayMinutes: number) {
    if (!policy || !activeAccount) return

    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiary: policy.walletAddress,
          coverageAmountAlgo: policy.coverage,
          flightNumber: policy.flightNumber,
          appId: APP_ID,
        }),
      })
      const data = await res.json()
      setPolicy(prev => ({ ...prev!, payoutTxId: data.txId, delayMinutes }))
      setStep('done')
    } catch (e: any) {
      setErrorMsg(e.message)
      setStep('error')
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-400/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 mb-4">
            Flight Delay Insurance
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            Get covered in{' '}
            <span className="text-gradient">60 seconds.</span>
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Connect your wallet, pick a flight, choose your coverage. That's it.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Main form / flow panel ── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">

              {/* FORM */}
              {step === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="glass rounded-2xl p-6 space-y-6"
                >
                  {/* Wallet connect */}
                  {!activeAccount ? (
                    <div className="border border-cyan-400/20 bg-cyan-400/5 rounded-xl p-5 text-center">
                      <Wallet className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                      <p className="text-sm text-zinc-300 mb-4">Connect your Algorand wallet to continue</p>
                      <Button
                        onClick={handleConnect}
                        className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-emerald-400/5 border border-emerald-400/20 rounded-xl">
                      <div className="status-dot" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500">Connected wallet</p>
                        <p className="text-sm font-mono text-zinc-300 truncate">{activeAccount.address}</p>
                      </div>
                    </div>
                  )}

                  <Separator className="bg-white/5" />

                  {/* Flight number */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-sm">Flight number</Label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        value={flightNumber}
                        onChange={e => setFlightNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. AI302, 6E204"
                        className="pl-10 bg-white/3 border-white/10 focus:border-cyan-400/50 text-white font-mono"
                        disabled={!activeAccount}
                      />
                    </div>
                    <p className="text-xs text-zinc-600">Enter the IATA flight code (airline code + flight number)</p>
                  </div>

                  {/* Coverage selector */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 text-sm">Coverage amount</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {COVERAGE_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setCoverage(opt)}
                          disabled={!activeAccount}
                          className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            coverage === opt
                              ? 'bg-cyan-400 text-black glow-cyan'
                              : 'glass glass-hover text-zinc-400 hover:text-white'
                          }`}
                        >
                          {opt}
                          <span className="text-xs ml-0.5 opacity-70">A</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-600">Coverage in ALGO · Triggers on ≥ 2 hour delay</p>
                  </div>

                  {/* Demo mode toggle */}
                  <div className="flex items-center gap-3 p-3 bg-amber-400/5 border border-amber-400/20 rounded-xl">
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-300 font-medium">Demo mode</p>
                      <p className="text-xs text-zinc-500">Simulate a delayed flight for the demo</p>
                    </div>
                    <button
                      onClick={() => setMockDelay(!mockDelay)}
                      className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${
                        mockDelay ? 'bg-amber-400' : 'bg-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${mockDelay ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <Button
                    onClick={() => setStep('confirm')}
                    disabled={!activeAccount || !flightNumber}
                    className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2 py-5"
                  >
                    Review Policy
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {/* CONFIRM */}
              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="glass rounded-2xl p-6 space-y-5"
                >
                  <h3 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>Review your policy</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Flight', value: flightNumber, mono: true },
                      { label: 'Coverage', value: `${coverage} ALGO` },
                      { label: 'Premium (5%)', value: `${premium} ALGO` },
                      { label: 'Trigger threshold', value: '≥ 120 minute delay' },
                      { label: 'Payout method', value: 'Atomic inner transaction' },
                      { label: 'Network', value: 'Algorand TestNet' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-sm text-zinc-500">{item.label}</span>
                        <span className={`text-sm font-medium text-white ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-cyan-400/5 border border-cyan-400/15 rounded-xl p-4">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      By purchasing this policy, you authorize a smart contract on Algorand TestNet to hold your premium and automatically pay out {coverage} ALGO to your wallet if flight {flightNumber} is delayed by 2+ hours.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('form')} className="flex-1 border-white/10 text-zinc-400">
                      Back
                    </Button>
                    <Button
                      onClick={handleBuyPolicy}
                      className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Pay {premium} ALGO
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* SIGNING */}
              {step === 'signing' && (
                <motion.div
                  key="signing"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-5">
                    <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Waiting for signature</h3>
                  <p className="text-zinc-400 text-sm">Approve the transaction in your wallet</p>
                </motion.div>
              )}

              {/* MONITORING */}
              {step === 'monitoring' && policy && (
                <motion.div
                  key="monitoring"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Policy active</h3>
                      <p className="text-xs text-zinc-500">Monitoring flight {policy.flightNumber}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="status-dot" />
                      <span className="text-xs text-emerald-400">Live</span>
                    </div>
                  </div>

                  {policy.txId && (
                    <a
                      href={`https://testnet.explorer.perawallet.app/tx/${policy.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-zinc-500 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="font-mono truncate">{policy.txId}</span>
                    </a>
                  )}

                  {policy.delayMinutes !== undefined && (
                    <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4">
                      <p className="text-sm text-zinc-300">
                        Current delay: <span className="text-amber-400 font-bold">{policy.delayMinutes} minutes</span>
                        {policy.delayMinutes < 120 && (
                          <span className="text-zinc-500 ml-2">(threshold: 120 min)</span>
                        )}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleCheckFlight}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    Check flight status now
                  </Button>
                </motion.div>
              )}

              {/* CHECKING */}
              {step === 'checking' && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-violet-400/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-5">
                    <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Oracle querying</h3>
                  <p className="text-zinc-400 text-sm">Fetching real-time flight data from AviationStack...</p>
                </motion.div>
              )}

              {/* PAYING */}
              {step === 'paying' && (
                <motion.div
                  key="paying"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-5">
                    <Zap className="w-7 h-7 text-amber-400 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Delay confirmed!</h3>
                  <p className="text-zinc-400 text-sm">Submitting atomic payout transaction to Algorand...</p>
                </motion.div>
              )}

              {/* DONE */}
              {step === 'done' && policy && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="glass rounded-2xl p-8 text-center border border-emerald-400/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-400/3" />
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                      className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-5"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2 text-emerald-400" style={{ fontFamily: 'Syne, sans-serif' }}>Payout sent!</h3>
                    <p className="text-zinc-300 mb-1">{policy.coverage} ALGO</p>
                    <p className="text-zinc-500 text-sm mb-6">
                      {policy.delayMinutes} minute delay confirmed · Paid automatically by smart contract
                    </p>
                    {policy.payoutTxId && (
                      <a
                        href={`https://testnet.explorer.perawallet.app/tx/${policy.payoutTxId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Pera Explorer
                      </a>
                    )}
                    <Button
                      onClick={() => { setStep('form'); setPolicy(null) }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    >
                      Buy another policy
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ERROR */}
              {step === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-8 text-center border border-red-400/20"
                >
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Something went wrong</h3>
                  <p className="text-zinc-400 text-sm mb-5 font-mono text-xs">{errorMsg}</p>
                  <Button onClick={() => setStep('form')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                    Try again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Premium calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5"
            >
              <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">Policy Summary</p>
              <div className="space-y-3">
                {[
                  { label: 'Coverage', value: `${coverage} ALGO` },
                  { label: 'Premium', value: `${premium} ALGO` },
                  { label: 'Trigger', value: '2 hr delay' },
                  { label: 'Settlement', value: '< 3 seconds' },
                  { label: 'Payout ratio', value: `${(coverage / premium).toFixed(0)}×` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
              <Separator className="bg-white/5 my-4" />
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">You pay today</span>
                <span className="text-cyan-400 font-bold text-lg">{premium} ALGO</span>
              </div>
            </motion.div>

            {/* How payout works */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5 space-y-3"
            >
              <p className="text-xs uppercase tracking-widest text-zinc-600">How payout works</p>
              {[
                { step: '1', text: 'Oracle detects delay ≥ 2h' },
                { step: '2', text: 'Smart contract auto-triggers' },
                { step: '3', text: 'ALGO arrives in your wallet' },
              ].map(item => (
                <div key={item.step} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-cyan-400 font-bold">{item.step}</span>
                  </div>
                  <span className="text-zinc-400">{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Security note */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-5 border border-emerald-400/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Non-custodial</p>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Your funds are locked in a verified smart contract. No human can intervene, delay, or deny your payout.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Activity({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
