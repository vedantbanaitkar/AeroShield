"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@txnlab/use-wallet-react";
import { Shield, Menu, X, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Get Insured" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();
  const { activeAccount, wallets } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const shortAddress = activeAccount
    ? `${activeAccount.address.slice(0, 4)}...${activeAccount.address.slice(-4)}`
    : null;

  function handleConnect() {
    // Try Pera first (native mobile wallet)
    const peraWallet = wallets?.find((w) => w.id === "pera");
    if (peraWallet) {
      peraWallet.connect();
    } else {
      // Fallback to WalletConnect
      wallets?.find((w) => w.id === "walletconnect")?.connect();
    }
  }
  function handleDisconnect() {
    wallets?.find((w) => w.isActive)?.disconnect();
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#fffdf8]/90 backdrop-blur-xl border-b border-stone-200"
            : "bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-200/50 rounded-lg blur-md group-hover:bg-sky-300/60 transition-all" />
                <div className="relative w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span
                className="font-syne font-700 text-lg tracking-tight"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}
              >
                Aero<span className="text-sky-700">Shield</span>
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] border-stone-300 text-stone-700 bg-stone-100 hidden sm:inline-flex"
              >
                TESTNET
              </Badge>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === link.href
                      ? "text-stone-900 bg-stone-200 border border-stone-300"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Wallet + CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {activeAccount ? (
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass glass-hover text-sm"
                >
                  <div className="status-dot" />
                  <span className="text-stone-700 font-mono text-xs">
                    {shortAddress}
                  </span>
                </button>
              ) : (
                <Button
                  onClick={handleConnect}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.2)]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
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
            className="fixed inset-x-0 top-16 z-40 bg-[#fffdf8]/95 backdrop-blur-xl border-b border-stone-200 lg:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    pathname === link.href
                      ? "text-stone-900 bg-stone-200 border border-stone-300"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100",
                  )}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              ))}
              <div className="pt-3 border-t border-stone-200">
                {activeAccount ? (
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm"
                  >
                    <div className="status-dot" />
                    <span className="font-mono text-xs text-stone-700">
                      {shortAddress}
                    </span>
                  </button>
                ) : (
                  <Button
                    onClick={handleConnect}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
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
  );
}
