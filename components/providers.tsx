"use client";
import {
  WalletProvider,
  WalletManager,
  WalletId,
  NetworkId,
} from "@txnlab/use-wallet-react";

const dappUrl =
  process.env.NEXT_PUBLIC_DAPP_URL ?? "https://aeroshield.vercel.app";

const manager = new WalletManager({
  wallets: [
    { id: WalletId.PERA },
    { id: WalletId.DEFLY },
    {
      id: WalletId.WALLETCONNECT,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
        metadata: {
          name: "AeroShield",
          description: "Parametric flight delay insurance on Algorand",
          url: dappUrl,
          icons: [],
        },
      },
    },
  ],
  defaultNetwork: NetworkId.TESTNET,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProvider manager={manager}>{children}</WalletProvider>;
}
