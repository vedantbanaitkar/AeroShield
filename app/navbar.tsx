'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@txnlab/use-wallet-react'
import { Shield, Menu, X, ChevronRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/',        label: 'Home' },
  { href: '/app',     label: 'Get Insured' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/explore', label: 'Explore' },
  { href: '/docs',    label: 'Docs' },
]

export function Navbar() {
  const pathname = usePathname()
  const { activeAccount, wallets } = useWallet()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const shortAddress = activeAccount
    ? `${activeAccount.address.slice(0, 4)}...${activeAccount.address.slice(-4)}`
    : null

  function handleConnect() {
    wallets?.find(w => w.id === 'walletconnect')?.connect()
  }
  function handleDisconnect() {
    wallets?.find(w => w.isActive)?.disconnect()
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur-md group-hover:bg-cyan-400/30 transition-all" />
                <div className="relative w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-black" strokeWidth={2.5} />
                </div>
              </div>
              <span className="font-syne font-700 text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                Aero<span className="text-cyan-400">Shield</span>
              </span>
              <Badge variant="outline" className="text-[10px] border-cyan-400/30 text-cyan-400 px-1.5 py-0 hidden sm:flex">
                TESTNET
              </Badge>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === link.href
                      ? 'text-white bg-white/8'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Wallet + CTA */}
            <div className="hidden md:flex items-center gap-3">
              {activeAccount ? (
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass glass-hover text-sm"
                >
                  <div className="status-dot" />
                  <span className="text-zinc-300 font-mono text-xs">{shortAddress}</span>
                </button>
              ) : (
                <Button
                  onClick={handleConnect}
                  size="sm"
                  className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold gap-1.5 glow-cyan"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 md:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === link.href
                      ? 'text-white bg-white/8 border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5">
                {activeAccount ? (
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm"
                  >
                    <div className="status-dot" />
                    <span className="font-mono text-xs text-zinc-300">{shortAddress}</span>
                  </button>
                ) : (
                  <Button
                    onClick={handleConnect}
                    className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-semibold"
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
