'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Code2, Shield, Zap, Globe,
  ChevronRight, Copy, Check, ExternalLink, Terminal
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as any },
})

const sections = [
  { id: 'overview',     label: 'Overview',          icon: BookOpen  },
  { id: 'architecture', label: 'Architecture',       icon: Globe     },
  { id: 'contract',     label: 'Smart Contract',     icon: Shield    },
  { id: 'oracle',       label: 'Oracle Layer',       icon: Zap       },
  { id: 'api',          label: 'API Reference',      icon: Code2     },
  { id: 'quickstart',   label: 'Quick Start',        icon: Terminal  },
]

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group glass rounded-xl overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs text-zinc-600">{language}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors opacity-0 group-hover:opacity-100">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-zinc-300 font-mono">{code}</pre>
    </div>
  )
}

function SectionHeader({ id, title, badge }: { id: string; title: string; badge?: string }) {
  return (
    <div id={id} className="flex items-center gap-3 mb-6 pt-2">
      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h2>
      {badge && <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 text-xs">{badge}</Badge>}
    </div>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Sidebar nav */}
          <aside className="md:col-span-1">
            <motion.div {...fadeUp()} className="sticky top-24">
              <p className="text-xs uppercase tracking-widest text-zinc-600 mb-3 px-3">Documentation</p>
              <nav className="space-y-0.5">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all',
                      activeSection === section.id
                        ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <section.icon className="w-4 h-4 flex-shrink-0" />
                    {section.label}
                  </a>
                ))}
              </nav>

              <div className="mt-6 glass rounded-xl p-4 border border-violet-400/10">
                <p className="text-xs text-zinc-600 mb-2">Need help?</p>
                <a href="#" className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Join Discord <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </aside>

          {/* Content */}
          <main className="md:col-span-3 space-y-16">

            {/* Overview */}
            <motion.section {...fadeUp(0.1)}>
              <SectionHeader id="overview" title="Overview" badge="v1.0 MVP" />
              <p className="text-zinc-400 leading-relaxed mb-4">
                AeroShield is a parametric insurance protocol built on the Algorand blockchain.
                Unlike traditional insurance, parametric insurance removes the claims process entirely —
                payout is automatic the moment a predefined data condition is met.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-6">
                The MVP focuses on flight delay insurance, where an oracle monitors real-time flight data
                and triggers an atomic inner transaction to pay the policyholder when a departure delay
                exceeds the threshold set at policy purchase.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Smart Contract', value: 'Algorand TypeScript', color: 'cyan' },
                  { label: 'Oracle',         value: 'AviationStack API',   color: 'violet' },
                  { label: 'Network',        value: 'Algorand TestNet',    color: 'emerald' },
                ].map(item => (
                  <div key={item.label} className="glass rounded-xl p-4">
                    <p className="text-xs text-zinc-600 mb-1">{item.label}</p>
                    <p className={`text-sm font-medium ${
                      item.color === 'cyan'    ? 'text-cyan-400' :
                      item.color === 'violet'  ? 'text-violet-400' :
                      'text-emerald-400'
                    }`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Architecture */}
            <motion.section {...fadeUp(0.15)}>
              <SectionHeader id="architecture" title="Architecture" />
              <p className="text-zinc-400 leading-relaxed mb-4">
                AeroShield consists of three components: a Next.js frontend, an oracle API route, and an Algorand smart contract.
              </p>
              <div className="space-y-3">
                {[
                  {
                    title: 'Frontend (Next.js + TypeScript)',
                    desc: 'Handles wallet connection via WalletConnect, policy configuration, transaction signing, and real-time status display.',
                    color: 'cyan',
                  },
                  {
                    title: 'Oracle Layer (Next.js API Route)',
                    desc: 'Server-side route that fetches flight delay data from AviationStack, evaluates the trigger condition, and calls the smart contract\'s triggerPayout method when eligible.',
                    color: 'violet',
                  },
                  {
                    title: 'Smart Contract (Algorand TypeScript)',
                    desc: 'Holds the premium, verifies oracle identity, and executes an atomic inner transaction to the policyholder\'s wallet when the oracle confirms a qualifying delay.',
                    color: 'emerald',
                  },
                ].map((item, i) => (
                  <div key={i} className="glass rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        item.color === 'cyan' ? 'text-cyan-400' :
                        item.color === 'violet' ? 'text-violet-400' : 'text-emerald-400'
                      }`} />
                      <div>
                        <p className="font-medium text-white text-sm mb-1">{item.title}</p>
                        <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Smart Contract */}
            <motion.section {...fadeUp(0.2)}>
              <SectionHeader id="contract" title="Smart Contract" badge="Algorand TypeScript" />
              <p className="text-zinc-400 leading-relaxed mb-4">
                The contract exposes two ABI methods: <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded text-xs">buyPolicy</code> and <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded text-xs">triggerPayout</code>.
                Only the authorized oracle address can call triggerPayout.
              </p>
              <CodeBlock language="algorand-typescript" code={`import { Contract } from '@algorandfoundation/algorand-typescript'
import { abimethod, GlobalState, itxn, Txn, Global, assert, gtxn } from '@algorandfoundation/algorand-typescript'

export class AeroShield extends Contract {
  oracle = GlobalState<Address>()
  owner  = GlobalState<Address>()

  @abimethod({ onCreate: 'require' })
  createApplication(oracle: Address): void {
    this.oracle.value = oracle
    this.owner.value  = Txn.sender
  }

  // User calls this with a payment txn for the premium
  @abimethod({ allowActions: ['NoOp'] })
  buyPolicy(
    payment: gtxn.PaymentTxn,
    flightNumber: string,
    coverageAmount: uint64,
  ): void {
    const premium = coverageAmount / 20  // 5%
    assert(payment.receiver === Global.currentApplicationAddress)
    assert(payment.amount >= premium)
    log(concat('POLICY:', flightNumber))
  }

  // Oracle calls this after confirming a delay
  @abimethod({ allowActions: ['NoOp'] })
  triggerPayout(
    beneficiary: Address,
    coverageAmount: uint64,
    flightNumber: string,
  ): void {
    assert(Txn.sender === this.oracle.value)
    itxn.payment({
      receiver: beneficiary,
      amount: coverageAmount,
      fee: 0,
    }).submit()
    log(concat('PAYOUT:', flightNumber))
  }
}`} />
            </motion.section>

            {/* Oracle */}
            <motion.section {...fadeUp(0.25)}>
              <SectionHeader id="oracle" title="Oracle Layer" />
              <p className="text-zinc-400 leading-relaxed mb-4">
                The oracle is a Next.js API route that acts as a trusted bridge between AviationStack's REST API and the Algorand smart contract.
                In production, this will be replaced by Goracle Network nodes for trustless decentralization.
              </p>
              <CodeBlock language="typescript" code={`// app/api/oracle/route.ts
export async function GET(req: NextRequest) {
  const flight = req.nextUrl.searchParams.get('flight')
  const mock   = req.nextUrl.searchParams.get('mock') === 'true'

  if (mock) {
    return NextResponse.json({
      flightNumber: flight,
      delayMinutes: 150,
      isEligible: true,
      status: 'delayed',
    })
  }

  const res = await fetch(
    \`http://api.aviationstack.com/v1/flights\` +
    \`?access_key=\${process.env.AVIATIONSTACK_API_KEY}\` +
    \`&flight_iata=\${flight}\`
  )
  const data  = await res.json()
  const flight_data = data?.data?.[0]
  const delay = flight_data?.departure?.delay ?? 0

  return NextResponse.json({
    flightNumber: flight,
    delayMinutes: delay,
    isEligible: delay >= 120,
    status: flight_data?.flight_status,
  })
}`} />
            </motion.section>

            {/* API Reference */}
            <motion.section {...fadeUp(0.3)}>
              <SectionHeader id="api" title="API Reference" />
              <div className="space-y-4">
                {[
                  {
                    method: 'GET',
                    path: '/api/oracle',
                    desc: 'Fetch real-time flight delay data and evaluate payout eligibility.',
                    params: [
                      { name: 'flight', type: 'string', desc: 'IATA flight code (e.g. AI302)' },
                      { name: 'mock',   type: 'boolean', desc: 'Return simulated 150min delay for demo' },
                    ],
                    color: 'emerald',
                  },
                  {
                    method: 'POST',
                    path: '/api/trigger',
                    desc: 'Trigger payout transaction from oracle wallet to beneficiary via smart contract.',
                    params: [
                      { name: 'beneficiary',       type: 'string', desc: 'Algorand address to receive payout' },
                      { name: 'coverageAmountAlgo', type: 'number', desc: 'Coverage in ALGO' },
                      { name: 'flightNumber',      type: 'string', desc: 'IATA flight code' },
                      { name: 'appId',             type: 'number', desc: 'Deployed contract App ID' },
                    ],
                    color: 'cyan',
                  },
                ].map(endpoint => (
                  <div key={endpoint.path} className="glass rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
                      <Badge className={endpoint.method === 'GET'
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 font-mono text-xs'
                        : 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20 font-mono text-xs'
                      }>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm text-zinc-300">{endpoint.path}</code>
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm text-zinc-400 mb-4">{endpoint.desc}</p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left">
                            <th className="text-zinc-600 pb-2 font-medium">Parameter</th>
                            <th className="text-zinc-600 pb-2 font-medium">Type</th>
                            <th className="text-zinc-600 pb-2 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {endpoint.params.map(param => (
                            <tr key={param.name}>
                              <td className="py-2 pr-4">
                                <code className="text-cyan-400">{param.name}</code>
                              </td>
                              <td className="py-2 pr-4 text-violet-400">{param.type}</td>
                              <td className="py-2 text-zinc-500">{param.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Quick Start */}
            <motion.section {...fadeUp(0.35)}>
              <SectionHeader id="quickstart" title="Quick Start" badge="5 min setup" />
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Clone and install', code: 'git clone https://github.com/team-chain-reaction/aeroshield\ncd aeroshield && npm install' },
                  { step: '2', title: 'Set environment variables', code: 'cp .env.example .env.local\n# Add your AviationStack API key and WalletConnect Project ID' },
                  { step: '3', title: 'Deploy smart contract', code: 'pipx install algokit\nalgokit deploy --network testnet' },
                  { step: '4', title: 'Start the dev server', code: 'npm run dev\n# Open http://localhost:3000' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs text-cyan-400 font-bold">{item.step}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                      <CodeBlock language="bash" code={item.code} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

          </main>
        </div>
      </div>
    </div>
  )
}
