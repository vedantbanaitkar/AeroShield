"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@txnlab/use-wallet-react";
import {
  Shield,
  Zap,
  Plane,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Info,
  Wallet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { policyRepository } from "@/lib/policies";
import algosdk from "algosdk";

const APP_ID = Number(process.env.NEXT_PUBLIC_APP_ID ?? 0);

type FlowStep =
  | "form"
  | "confirm"
  | "signing"
  | "monitoring"
  | "checking"
  | "paying"
  | "done"
  | "error";
type InsuranceType = "flight" | "weather" | "cargo";
type FlightDelayThreshold = 90 | 120 | 180;

interface Policy {
  policyRecordId?: string;
  persistenceWarning?: string;
  productId: InsuranceType;
  productLabel: string;
  flightNumber: string;
  delayThreshold?: FlightDelayThreshold;
  region?: string;
  cropType?: string;
  routeFrom?: string;
  routeTo?: string;
  cargoValue?: number;
  coverage: number;
  premium: number;
  walletAddress: string;
  summary: Array<{ label: string; value: string; mono?: boolean }>;
  triggerDescription: string;
  appId: number;
  appCallTxId?: string;
  txId?: string;
  delayMinutes?: number;
  payoutTxId?: string;
  payoutDemoMode?: boolean;
  balanceBeforePurchase?: number;
  balanceAfterPurchase?: number;
  balanceAfterPayout?: number;
}

interface ProductConfig {
  id: InsuranceType;
  title: string;
  subtitle: string;
  coverageOptions: number[];
  defaultCoverage: number;
  accent: "cyan" | "emerald" | "violet";
  summaryLine: string;
  isOnChainReady: boolean;
}

const INSURANCE_PRODUCTS: ProductConfig[] = [
  {
    id: "flight",
    title: "Flight Delay",
    subtitle: "Airport-to-wallet coverage for delayed departures",
    coverageOptions: [5, 10, 25, 50, 100],
    defaultCoverage: 10,
    accent: "cyan",
    summaryLine: "Departure delay threshold",
    isOnChainReady: true,
  },
  {
    id: "weather",
    title: "Crop Weather",
    subtitle: "Yield protection for rainfall and monsoon risk",
    coverageOptions: [100, 250, 500, 1000, 2500],
    defaultCoverage: 250,
    accent: "emerald",
    summaryLine: "Rainfall strike trigger",
    isOnChainReady: false,
  },
  {
    id: "cargo",
    title: "Cargo & Freight",
    subtitle: "Shipment delay cover for exporters and importers",
    coverageOptions: [25, 50, 100, 250, 500],
    defaultCoverage: 50,
    accent: "violet",
    summaryLine: "Route delay trigger",
    isOnChainReady: false,
  },
];

function getProductConfig(productId: InsuranceType) {
  return (
    INSURANCE_PRODUCTS.find((product) => product.id === productId) ??
    INSURANCE_PRODUCTS[0]
  );
}

function getCoverageMultiplier(
  productId: InsuranceType,
  formState: {
    delayThreshold: FlightDelayThreshold;
    region: string;
    cropType: string;
    routeFrom: string;
    routeTo: string;
    cargoValue: string;
  },
) {
  if (productId === "flight") {
    return formState.delayThreshold === 90
      ? 0.9
      : formState.delayThreshold === 180
        ? 1.2
        : 1;
  }

  if (productId === "weather") {
    const regionFactor = formState.region.toLowerCase().includes("coastal")
      ? 1.25
      : formState.region.toLowerCase().includes("monsoon")
        ? 1.15
        : 1;
    const cropFactor =
      formState.cropType === "Rice"
        ? 1.12
        : formState.cropType === "Cotton"
          ? 1.08
          : 1;
    return regionFactor * cropFactor;
  }

  const cargoValue = Number(formState.cargoValue || 0);
  const valueFactor =
    cargoValue >= 20000 ? 1.25 : cargoValue >= 10000 ? 1.15 : 1;
  const routeFactor = formState.routeFrom !== formState.routeTo ? 1.05 : 1.2;
  return valueFactor * routeFactor;
}

function calculatePremium(
  productId: InsuranceType,
  coverage: number,
  formState: {
    delayThreshold: FlightDelayThreshold;
    region: string;
    cropType: string;
    routeFrom: string;
    routeTo: string;
    cargoValue: string;
  },
) {
  const baseRate =
    productId === "flight" ? 0.05 : productId === "weather" ? 0.035 : 0.04;
  const premium =
    coverage * baseRate * getCoverageMultiplier(productId, formState);
  return +premium.toFixed(2);
}

function buildSummary(
  productId: InsuranceType,
  coverage: number,
  premium: number,
  formState: {
    flightNumber: string;
    delayThreshold: FlightDelayThreshold;
    region: string;
    cropType: string;
    routeFrom: string;
    routeTo: string;
    cargoValue: string;
  },
) {
  if (productId === "flight") {
    return [
      { label: "Flight", value: formState.flightNumber, mono: true },
      { label: "Coverage", value: `${coverage} ALGO` },
      { label: "Premium", value: `${premium} ALGO` },
      {
        label: "Trigger threshold",
        value: `≥ ${formState.delayThreshold} minute delay`,
      },
      { label: "Payout method", value: "Atomic inner transaction" },
      { label: "Network", value: "Algorand TestNet" },
    ];
  }

  if (productId === "weather") {
    return [
      { label: "Region", value: formState.region },
      { label: "Crop", value: formState.cropType },
      { label: "Coverage", value: `${coverage} ALGO` },
      { label: "Premium", value: `${premium} ALGO` },
      { label: "Trigger threshold", value: "Rainfall strike breached" },
      { label: "Network", value: "Algorand TestNet" },
    ];
  }

  return [
    {
      label: "Route",
      value: `${formState.routeFrom} → ${formState.routeTo}`,
      mono: true,
    },
    { label: "Cargo value", value: `${formState.cargoValue} ALGO` },
    { label: "Coverage", value: `${coverage} ALGO` },
    { label: "Premium", value: `${premium} ALGO` },
    { label: "Trigger threshold", value: "Route delay or disruption" },
    { label: "Network", value: "Algorand TestNet" },
  ];
}

export default function AppPage() {
  const { activeAccount, wallets, signTransactions } = useWallet();
  const [isHydrated, setIsHydrated] = useState(false);
  const [productId, setProductId] = useState<InsuranceType>("flight");
  const [step, setStep] = useState<FlowStep>("form");
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [flightNumber, setFlightNumber] = useState("AI302");
  const [delayThreshold, setDelayThreshold] =
    useState<FlightDelayThreshold>(120);
  const [region, setRegion] = useState("Coastal Karnataka");
  const [cropType, setCropType] = useState("Rice");
  const [routeFrom, setRouteFrom] = useState("BOM");
  const [routeTo, setRouteTo] = useState("DEL");
  const [cargoValue, setCargoValue] = useState("5000");
  const [coverage, setCoverage] = useState(10);
  const [errorMsg, setErrorMsg] = useState("");
  const [mockDelay, setMockDelay] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const selectedProduct = getProductConfig(productId);
  const premium = calculatePremium(productId, coverage, {
    delayThreshold,
    region,
    cropType,
    routeFrom,
    routeTo,
    cargoValue,
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const defaultCoverage = getProductConfig(productId).defaultCoverage;
    setCoverage(defaultCoverage);
    setStep("form");
  }, [productId]);

  // Fetch wallet balance when account connects
  useEffect(() => {
    if (!activeAccount) {
      setWalletBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const algodClient = new algosdk.Algodv2(
          process.env.NEXT_PUBLIC_ALGOD_TOKEN ?? "",
          process.env.NEXT_PUBLIC_ALGOD_SERVER ??
            "https://testnet-api.algonode.cloud",
          Number(process.env.NEXT_PUBLIC_ALGOD_PORT ?? 443),
        );
        const accountInfo = await algodClient
          .accountInformation(activeAccount.address)
          .do();
        setWalletBalance(Number(accountInfo.amount) / 1_000_000); // Convert microAlgo to Algo
      } catch (e) {
        console.error("Failed to fetch balance:", e);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [activeAccount]);

  function isConnectCancelledError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return /modal is closed by user|cancelled|canceled|rejected|proposal expired|session expired/i.test(
      message.toLowerCase(),
    );
  }

  async function tryConnect(
    walletId: string,
  ): Promise<"connected" | "cancelled" | "failed"> {
    const wallet = wallets?.find((w) => w.id === walletId);
    if (!wallet) return "failed";

    try {
      await wallet.connect();
      return "connected";
    } catch (error) {
      if (isConnectCancelledError(error)) {
        return "cancelled";
      }

      console.error(`Failed to connect with ${walletId}:`, error);
      return "failed";
    }
  }

  async function handleConnect() {
    const preferredOrder = ["pera"];

    for (const walletId of preferredOrder) {
      const result = await tryConnect(walletId);
      if (result === "connected") {
        return;
      }
      if (result === "cancelled") {
        return;
      }
    }

    setErrorMsg(
      "Pera Wallet could not connect. Install or reopen Pera Wallet, then try again.",
    );
    setStep("error");
  }

  const showConnectedWallet = isHydrated && !!activeAccount;
  const isWalletReady = isHydrated && !!activeAccount;

  async function handleBuyPolicy() {
    if (!activeAccount) return;
    if (productId !== "flight") {
      setErrorMsg(
        "Only Flight Delay is wired on-chain in this MVP. Weather and Cargo are demo previews.",
      );
      setStep("error");
      return;
    }
    setStep("signing");
    setErrorMsg("");

    try {
      const algodClient = new algosdk.Algodv2(
        process.env.NEXT_PUBLIC_ALGOD_TOKEN ?? "",
        process.env.NEXT_PUBLIC_ALGOD_SERVER ??
          "https://testnet-api.algonode.cloud",
        Number(process.env.NEXT_PUBLIC_ALGOD_PORT ?? 443),
      );

      // Capture balance before purchase
      const accountInfoBefore = await algodClient
        .accountInformation(activeAccount.address)
        .do();
      const balanceBefore = Number(accountInfoBefore.amount) / 1_000_000;

      const sp = await algodClient.getTransactionParams().do();
      const premiumMicroAlgo = Math.round(premium * 1_000_000);
      const appAddress = algosdk.getApplicationAddress(APP_ID);
      const summary = buildSummary(productId, coverage, premium, {
        flightNumber,
        delayThreshold,
        region,
        cropType,
        routeFrom,
        routeTo,
        cargoValue,
      });

      const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAccount.address,
        receiver: APP_ID > 0 ? appAddress : activeAccount.address,
        amount: premiumMicroAlgo,
        suggestedParams: sp,
        note: new TextEncoder().encode(
          `AeroShield:${productId}:${flightNumber || routeFrom}`,
        ),
      });

      const buyPolicyMethod = algosdk.ABIMethod.fromSignature(
        "buyPolicy(pay,string,uint64,uint64)void",
      );
      const composer = new algosdk.AtomicTransactionComposer();
      const emptySigner = algosdk.makeEmptyTransactionSigner();

      composer.addMethodCall({
        appID: APP_ID,
        method: buyPolicyMethod,
        sender: activeAccount.address,
        methodArgs: [
          { txn: payTxn, signer: emptySigner },
          flightNumber,
          BigInt(coverage * 1_000_000),
          BigInt(delayThreshold),
        ],
        suggestedParams: {
          ...sp,
          fee: 2_000,
          flatFee: true,
        },
        signer: emptySigner,
      });

      const txns = composer.buildGroup().map((t) => t.txn);
      const encoded = txns.map((txn) => txn.toByte());
      const signed = await signTransactions(encoded);
      await algodClient.sendRawTransaction(signed as Uint8Array[]).do();
      const paymentTxId =
        txns.find((txn) => txn.type === "pay")?.txID() ?? txns[0].txID();
      const appCallTxId =
        txns.find((txn) => txn.type === "appl")?.txID() ??
        txns[txns.length - 1].txID();

      // Wait a moment for transaction to settle and capture balance after
      await new Promise((r) => setTimeout(r, 2000));
      const accountInfoAfter = await algodClient
        .accountInformation(activeAccount.address)
        .do();
      const balanceAfter = Number(accountInfoAfter.amount) / 1_000_000;

      const newPolicy: Policy = {
        productId,
        productLabel: selectedProduct.title,
        flightNumber,
        delayThreshold,
        region,
        cropType,
        routeFrom,
        routeTo,
        cargoValue: Number(cargoValue),
        coverage,
        premium,
        walletAddress: activeAccount.address,
        summary,
        triggerDescription: selectedProduct.summaryLine,
        appId: APP_ID,
        txId: paymentTxId,
        appCallTxId,
        balanceBeforePurchase: balanceBefore,
        balanceAfterPurchase: balanceAfter,
      };
      let storedPolicyId: string | undefined;
      let persistenceWarning: string | undefined;

      try {
        const storedPolicy = await policyRepository.create({
          walletAddress: activeAccount.address,
          productId,
          productLabel: selectedProduct.title,
          flightNumber,
          routeFrom,
          routeTo,
          region,
          cropType,
          delayThreshold,
          coverage,
          premium,
          appId: APP_ID,
          premiumPaymentTxId: paymentTxId,
          appCallTxId,
        });
        storedPolicyId = storedPolicy.id;
      } catch (persistError: any) {
        const msg =
          persistError?.message ?? "Unable to persist policy record to DB";
        persistenceWarning =
          "Policy was purchased on-chain, but database save failed. Dashboard history may not update until DB connectivity is restored.";
        console.warn("Policy DB persistence failed after successful buy:", msg);
      }

      setPolicy({
        ...newPolicy,
        policyRecordId: storedPolicyId,
        persistenceWarning,
      });
      setWalletBalance(balanceAfter);
      setStep("monitoring");
    } catch (e: any) {
      const rawMessage = e?.message ?? "Transaction failed";
      const isAppIdMismatch =
        /ApplicationArgs 0|logic eval error|err opcode executed/i.test(
          rawMessage,
        );

      setErrorMsg(
        isAppIdMismatch
          ? "Contract call failed. This usually means NEXT_PUBLIC_APP_ID on this deployment points to a different app than the deployed ABI. Update APP_ID and redeploy."
          : rawMessage,
      );
      setStep("error");
    }
  }

  async function handleCheckFlight() {
    if (!policy) return;
    setStep("checking");

    try {
      if (policy.productId !== "flight") {
        const demoDelay = mockDelay ? 150 : 0;
        setPolicy((prev) => ({ ...prev!, delayMinutes: demoDelay }));

        if (policy.policyRecordId) {
          await policyRepository.update(policy.policyRecordId, {
            delayMinutes: demoDelay,
            lastOracleCheckAt: new Date().toISOString(),
          });
        }

        if (mockDelay) {
          setStep("paying");
          await triggerPayout(demoDelay);
        } else {
          setStep("monitoring");
        }
        return;
      }

      const url = `/api/oracle?flight=${policy.flightNumber}${mockDelay ? "&mock=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      setPolicy((prev) => ({ ...prev!, delayMinutes: data.delayMinutes }));

      if (policy.policyRecordId) {
        await policyRepository.update(policy.policyRecordId, {
          delayMinutes: data.delayMinutes,
          lastOracleCheckAt: new Date().toISOString(),
        });
      }

      if (data.isEligible) {
        setStep("paying");
        await triggerPayout(data.delayMinutes);
      } else {
        setStep("monitoring");
      }
    } catch (e: any) {
      setErrorMsg(e.message);
      setStep("error");
    }
  }

  async function triggerPayout(delayMinutes: number) {
    if (!policy || !activeAccount) return;

    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiary: policy.walletAddress,
          coverageAmountAlgo: policy.coverage,
          flightNumber:
            policy.productId === "flight"
              ? policy.flightNumber
              : `${policy.productLabel}:${policy.routeFrom ?? "N/A"}`,
          appId: APP_ID,
          demoMode: mockDelay,
        }),
      });
      const data = await res.json();
      const isDemoModePayout = Boolean(data?.demoMode);

      if (!res.ok || !data?.txId) {
        throw new Error(
          data?.error ?? `Trigger payout failed (HTTP ${res.status})`,
        );
      }

      // Capture balance after payout
      const algodClient = new algosdk.Algodv2(
        process.env.NEXT_PUBLIC_ALGOD_TOKEN ?? "",
        process.env.NEXT_PUBLIC_ALGOD_SERVER ??
          "https://testnet-api.algonode.cloud",
        Number(process.env.NEXT_PUBLIC_ALGOD_PORT ?? 443),
      );
      await new Promise((r) => setTimeout(r, 2000)); // Wait for payout to settle
      const accountInfo = await algodClient
        .accountInformation(activeAccount.address)
        .do();
      const balanceAfter = Number(accountInfo.amount) / 1_000_000;

      setPolicy((prev) => ({
        ...prev!,
        payoutTxId: data.txId,
        payoutDemoMode: isDemoModePayout,
        delayMinutes,
        balanceAfterPayout: balanceAfter,
      }));

      if (policy.policyRecordId) {
        await policyRepository.update(policy.policyRecordId, {
          payoutTxId: data.txId,
          delayMinutes,
          payoutTriggeredAt: new Date().toISOString(),
          lastOracleCheckAt: new Date().toISOString(),
        });
      }

      setWalletBalance(balanceAfter);
      setStep("done");
    } catch (e: any) {
      setErrorMsg(e.message);
      setStep("error");
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
          <h1
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Get covered in <span className="text-gradient">60 seconds.</span>
          </h1>
          <p className="text-slate-700 max-w-lg mx-auto">
            Connect your wallet, pick a flight, choose your coverage. That's it.
          </p>
        </motion.div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-8 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-left text-red-50 shadow-lg shadow-red-950/10"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Payout error</p>
                  <p className="mt-1 wrap-break-word text-sm text-red-100/90">
                    {errorMsg}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-5 gap-6">
          {/* ── Main form / flow panel ── */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {/* FORM */}
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="glass rounded-2xl p-6 space-y-6"
                >
                  {/* Wallet connect */}
                  {!showConnectedWallet ? (
                    <div className="border border-cyan-400/20 bg-cyan-400/5 rounded-xl p-5 text-center">
                      <Wallet className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-700 mb-4">
                        Connect your Algorand wallet to continue
                      </p>
                      <Button
                        onClick={handleConnect}
                        className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-emerald-400/5 border border-emerald-400/20 rounded-xl">
                        <div className="status-dot" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600">
                            Connected wallet
                          </p>
                          <p className="text-sm font-mono text-slate-800 truncate">
                            {activeAccount.address}
                          </p>
                        </div>
                      </div>
                      {showConnectedWallet && walletBalance !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 border border-cyan-400/20 rounded-xl"
                        >
                          <Wallet className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-slate-600">
                              Wallet Balance
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                              {walletBalance.toFixed(2)} ALGO
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Insurance type selector */}
                  <div className="space-y-2">
                    <Label className="text-slate-900 text-sm font-medium">
                      Insurance type
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {INSURANCE_PRODUCTS.map((product) => {
                        const isActive = product.id === productId;
                        return (
                          <button
                            key={product.id}
                            onClick={() => setProductId(product.id)}
                            type="button"
                            className={`rounded-xl border p-3 text-left transition-all ${
                              isActive
                                ? "border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {product.title}
                                </p>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                  {product.subtitle}
                                </p>
                                {!product.isOnChainReady && (
                                  <p className="text-[10px] mt-1 font-semibold text-violet-600 uppercase tracking-wider">
                                    Demo preview
                                  </p>
                                )}
                              </div>
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  product.accent === "cyan"
                                    ? "bg-cyan-400"
                                    : product.accent === "emerald"
                                      ? "bg-emerald-400"
                                      : "bg-violet-400"
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  {/* Product-specific form */}
                  {productId === "flight" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-900 text-sm font-medium">
                          Flight number
                        </Label>
                        <div className="relative">
                          <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            value={flightNumber}
                            onChange={(e) =>
                              setFlightNumber(e.target.value.toUpperCase())
                            }
                            placeholder="e.g. AI302, 6E204"
                            className="pl-10 bg-white/8 border-white/15 focus:border-cyan-400/60 text-slate-900 font-mono placeholder:text-slate-500"
                            disabled={!isWalletReady}
                          />
                        </div>
                        <p className="text-xs text-slate-600">
                          Enter the IATA flight code (airline code + flight
                          number)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900 text-sm font-medium">
                          Delay threshold
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {([90, 120, 180] as FlightDelayThreshold[]).map(
                            (threshold) => (
                              <button
                                key={threshold}
                                type="button"
                                onClick={() => setDelayThreshold(threshold)}
                                disabled={!isWalletReady}
                                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                  delayThreshold === threshold
                                    ? "bg-cyan-400 text-black glow-cyan"
                                    : "glass glass-hover text-slate-700 hover:text-slate-900"
                                }`}
                              >
                                {threshold} min
                              </button>
                            ),
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          Premium scales with the delay threshold you choose
                        </p>
                      </div>
                    </div>
                  )}

                  {productId === "weather" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-900 text-sm font-medium">
                          Region
                        </Label>
                        <Input
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          placeholder="e.g. Coastal Karnataka"
                          className="bg-white/8 border-white/15 focus:border-emerald-400/60 text-slate-900 placeholder:text-slate-500"
                          disabled={!isWalletReady}
                        />
                        <p className="text-xs text-slate-600">
                          Location-based weather risk drives the premium
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900 text-sm font-medium">
                          Crop type
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {["Rice", "Wheat", "Cotton"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setCropType(item)}
                              disabled={!isWalletReady}
                              className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                cropType === item
                                  ? "bg-emerald-400 text-black glow-cyan"
                                  : "glass glass-hover text-slate-700 hover:text-slate-900"
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-600">
                          Different crops carry different rainfall sensitivity
                        </p>
                      </div>
                    </div>
                  )}

                  {productId === "cargo" && (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-slate-900 text-sm font-medium">
                            Origin
                          </Label>
                          <Input
                            value={routeFrom}
                            onChange={(e) =>
                              setRouteFrom(e.target.value.toUpperCase())
                            }
                            placeholder="BOM"
                            className="bg-white/8 border-white/15 focus:border-violet-400/60 text-slate-900 placeholder:text-slate-500 font-mono"
                            disabled={!isWalletReady}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-900 text-sm font-medium">
                            Destination
                          </Label>
                          <Input
                            value={routeTo}
                            onChange={(e) =>
                              setRouteTo(e.target.value.toUpperCase())
                            }
                            placeholder="DEL"
                            className="bg-white/8 border-white/15 focus:border-violet-400/60 text-slate-900 placeholder:text-slate-500 font-mono"
                            disabled={!isWalletReady}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900 text-sm font-medium">
                          Cargo value
                        </Label>
                        <Input
                          type="number"
                          value={cargoValue}
                          onChange={(e) => setCargoValue(e.target.value)}
                          placeholder="5000"
                          className="bg-white/8 border-white/15 focus:border-violet-400/60 text-slate-900 placeholder:text-slate-500"
                          disabled={!isWalletReady}
                        />
                        <p className="text-xs text-slate-600">
                          Higher cargo value increases the premium automatically
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Coverage selector */}
                  <div className="space-y-3">
                    <Label className="text-slate-900 text-sm font-medium">
                      Coverage amount
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {selectedProduct.coverageOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setCoverage(opt)}
                          disabled={!isWalletReady}
                          className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            coverage === opt
                              ? "bg-cyan-400 text-black glow-cyan"
                              : "glass glass-hover text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          {opt}
                          <span className="text-xs ml-0.5 opacity-70">A</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">
                      {selectedProduct.summaryLine} · Premium recalculates
                      instantly
                    </p>
                  </div>

                  {/* Demo mode toggle */}
                  <div className="flex items-center gap-3 p-3 bg-amber-400/5 border border-amber-400/20 rounded-xl">
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-300 font-medium">
                        Demo mode
                      </p>
                      <p className="text-xs text-slate-600">
                        Simulate the payout trigger for the demo
                      </p>
                    </div>
                    <button
                      onClick={() => setMockDelay(!mockDelay)}
                      className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${
                        mockDelay ? "bg-amber-400" : "bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${mockDelay ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>

                  <Button
                    onClick={() => setStep("confirm")}
                    disabled={
                      !selectedProduct.isOnChainReady ||
                      !isWalletReady ||
                      !APP_ID ||
                      (productId === "flight" && !flightNumber) ||
                      (productId === "weather" && !region) ||
                      (productId === "cargo" &&
                        (!routeFrom || !routeTo || !cargoValue))
                    }
                    className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold gap-2 py-5"
                  >
                    Review Policy
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {!selectedProduct.isOnChainReady && (
                    <p className="text-xs text-slate-600 text-center">
                      {selectedProduct.title} is a demo preview in this MVP.
                      On-chain purchase is enabled for Flight Delay.
                    </p>
                  )}

                  {!!activeAccount && !APP_ID && (
                    <p className="text-xs text-amber-600 text-center">
                      NEXT_PUBLIC_APP_ID is not set. Deploy contract first and
                      add App ID to continue.
                    </p>
                  )}
                </motion.div>
              )}

              {/* CONFIRM */}
              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="glass rounded-2xl p-6 space-y-5"
                >
                  <h3
                    className="font-bold text-lg"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Review your policy
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    {selectedProduct.title}
                  </p>
                  <div className="space-y-3">
                    {buildSummary(productId, coverage, premium, {
                      flightNumber,
                      delayThreshold,
                      region,
                      cropType,
                      routeFrom,
                      routeTo,
                      cargoValue,
                    }).map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-sm text-slate-600">
                          {item.label}
                        </span>
                        <span
                          className={`text-sm font-medium text-slate-900 ${item.mono ? "font-mono" : ""}`}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-cyan-400/5 border border-cyan-400/15 rounded-xl p-4">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      By purchasing this {selectedProduct.title.toLowerCase()}{" "}
                      policy, you authorize a smart contract on Algorand TestNet
                      to hold your premium and automatically settle {coverage}{" "}
                      ALGO to your wallet when the trigger condition is met.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep("form")}
                      className="flex-1 border-white/10 text-slate-700"
                    >
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
              {step === "signing" && (
                <motion.div
                  key="signing"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-5">
                    <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                  </div>
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Waiting for signature
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Approve the transaction in your wallet
                  </p>
                </motion.div>
              )}

              {/* MONITORING */}
              {step === "monitoring" && policy && (
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
                      <h3
                        className="font-bold"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        Policy active
                      </h3>
                      <p className="text-xs text-slate-600">
                        Monitoring {policy.productLabel}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="status-dot" />
                      <span className="text-xs text-emerald-400">Live</span>
                    </div>
                  </div>

                  {/* Transaction summary */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-slate-600 uppercase tracking-widest">
                      {policy.productLabel} purchase confirmed
                    </p>
                    {policy.balanceBeforePurchase !== undefined &&
                      policy.balanceAfterPurchase !== undefined && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">
                              Before purchase
                            </span>
                            <span className="font-mono text-sm text-slate-800">
                              {policy.balanceBeforePurchase.toFixed(2)} ALGO
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-red-400/5 border border-red-400/20 rounded-lg">
                            <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <span className="text-sm text-red-300">
                              Premium paid
                            </span>
                            <span className="ml-auto font-bold text-red-400">
                              -{policy.premium} ALGO
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">
                              After purchase
                            </span>
                            <span className="font-mono text-sm text-slate-800">
                              {policy.balanceAfterPurchase.toFixed(2)} ALGO
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  {policy.txId && (
                    <a
                      href={`https://testnet.explorer.perawallet.app/tx/${policy.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="font-mono truncate">
                        Premium payment tx: {policy.txId}
                      </span>
                    </a>
                  )}

                  {policy.appCallTxId && (
                    <a
                      href={`https://testnet.explorer.perawallet.app/tx/${policy.appCallTxId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="font-mono truncate">
                        Buy policy app call tx: {policy.appCallTxId}
                      </span>
                    </a>
                  )}

                  <p className="text-xs text-slate-600">
                    App ID: <span className="font-mono">{policy.appId}</span>
                  </p>

                  {policy.persistenceWarning && (
                    <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
                      <p className="text-xs text-amber-300 leading-relaxed">
                        {policy.persistenceWarning}
                      </p>
                    </div>
                  )}

                  <a
                    href={`https://testnet.explorer.perawallet.app/address/${algosdk.getApplicationAddress(policy.appId).toString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-slate-600 hover:text-cyan-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="font-mono truncate">
                      App escrow:{" "}
                      {algosdk.getApplicationAddress(policy.appId).toString()}
                    </span>
                  </a>

                  {policy.delayMinutes !== undefined && (
                    <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4">
                      <p className="text-sm text-slate-700">
                        Trigger result:{" "}
                        <span className="text-amber-400 font-bold">
                          {policy.delayMinutes} minutes
                        </span>
                        {policy.productId === "flight" &&
                          policy.delayMinutes <
                            (policy.delayThreshold ?? 120) && (
                            <span className="text-slate-500 ml-2">
                              (threshold: {policy.delayThreshold ?? 120} min)
                            </span>
                          )}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleCheckFlight}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    Check trigger status now
                  </Button>
                </motion.div>
              )}

              {/* CHECKING */}
              {step === "checking" && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-violet-400/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-5">
                    <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
                  </div>
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Oracle querying
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Fetching real-time flight data from AviationStack...
                  </p>
                </motion.div>
              )}

              {/* PAYING */}
              {step === "paying" && (
                <motion.div
                  key="paying"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-5">
                    <Zap className="w-7 h-7 text-amber-400 animate-pulse" />
                  </div>
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Delay confirmed!
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Submitting atomic payout transaction to Algorand...
                  </p>
                </motion.div>
              )}

              {/* DONE */}
              {step === "done" && policy && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="glass rounded-2xl p-8 text-center border border-emerald-400/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-400/3" />
                  <div className="relative space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        delay: 0.1,
                        stiffness: 200,
                      }}
                      className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </motion.div>

                    <div>
                      <h3
                        className="text-2xl font-bold mb-2 text-emerald-400"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        {policy.payoutDemoMode
                          ? "Demo payout sent!"
                          : "Payout sent!"}
                      </h3>
                      <p className="text-slate-700 mb-1">
                        {policy.productLabel} · {policy.coverage} ALGO
                      </p>
                      <p className="text-slate-600 text-sm mb-2">
                        {policy.payoutDemoMode
                          ? `${policy.delayMinutes} minute trigger confirmed · Demo mode on testnet`
                          : `${policy.delayMinutes} minute trigger confirmed · Paid automatically by smart contract`}
                      </p>
                    </div>

                    {/* Payout fund movement */}
                    {policy.balanceAfterPurchase !== undefined &&
                      policy.balanceAfterPayout !== undefined && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-left">
                          <p className="text-xs text-slate-600 uppercase tracking-widest">
                            Payout settlement
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">
                                Before payout
                              </span>
                              <span className="font-mono text-sm text-slate-800">
                                {policy.balanceAfterPurchase.toFixed(2)} ALGO
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-400/5 border border-emerald-400/20 rounded-lg">
                              <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <span className="text-sm text-emerald-300">
                                {policy.payoutDemoMode
                                  ? "Demo payout"
                                  : "Coverage received"}
                              </span>
                              <span className="ml-auto font-bold text-emerald-400">
                                +{policy.coverage} ALGO
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">
                                After payout
                              </span>
                              <span className="font-mono text-sm text-slate-900 font-bold">
                                {policy.balanceAfterPayout.toFixed(2)} ALGO
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {policy.payoutTxId && (
                      <a
                        href={`https://testnet.explorer.perawallet.app/tx/${policy.payoutTxId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View payout transaction on Pera Explorer
                      </a>
                    )}

                    <Button
                      onClick={() => {
                        setStep("form");
                        setPolicy(null);
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    >
                      Buy another policy
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ERROR */}
              {step === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-8 text-center border border-red-400/20"
                >
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Something went wrong
                  </h3>
                  <p className="text-zinc-400 text-sm mb-5 font-mono text-xs">
                    {errorMsg}
                  </p>
                  <Button
                    onClick={() => setStep("form")}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                  >
                    Try again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sidebar ── */}
          <div className="md:col-span-2 space-y-4">
            {/* Premium calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5"
            >
              <p className="text-xs uppercase tracking-widest text-slate-700 font-semibold mb-4">
                Policy Summary
              </p>
              <div className="space-y-3">
                {[
                  { label: "Coverage", value: `${coverage} ALGO` },
                  { label: "Premium", value: `${premium} ALGO` },
                  { label: "Trigger", value: "2 hr delay" },
                  { label: "Settlement", value: "< 3 seconds" },
                  {
                    label: "Payout ratio",
                    value: `${(coverage / premium).toFixed(0)}×`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-slate-600">{item.label}</span>
                    <span className="text-slate-900 font-semibold">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="bg-white/5 my-4" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium">
                  You pay today
                </span>
                <span className="text-cyan-400 font-bold text-lg">
                  {premium} ALGO
                </span>
              </div>
            </motion.div>

            {/* How payout works */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5 space-y-3"
            >
              <p className="text-xs uppercase tracking-widest text-slate-700 font-semibold">
                How payout works
              </p>
              {[
                { step: "1", text: "Oracle detects delay ≥ 2h" },
                { step: "2", text: "Smart contract auto-triggers" },
                { step: "3", text: "ALGO arrives in your wallet" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-cyan-400 font-bold">
                      {item.step}
                    </span>
                  </div>
                  <span className="text-slate-700">{item.text}</span>
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
                <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
                  Non-custodial
                </p>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Your funds are locked in a verified smart contract. No human can
                intervene, delay, or deny your payout.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
