"use client";
import {
  WalletProvider,
  WalletManager,
  WalletId,
  NetworkId,
} from "@txnlab/use-wallet-react";
import { ThemeProvider } from "@/components/theme-provider";

const dappUrl =
  process.env.NEXT_PUBLIC_DAPP_URL ?? "https://aeroshield.vercel.app";

const manager = new WalletManager({
  wallets: [{ id: WalletId.PERA }],
  defaultNetwork: NetworkId.TESTNET,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WalletProvider manager={manager}>{children}</WalletProvider>
    </ThemeProvider>
  );
}
