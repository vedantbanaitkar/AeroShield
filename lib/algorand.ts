import algosdk from "algosdk";

export function getAlgodClient() {
  const server =
    process.env.NEXT_PUBLIC_ALGOD_SERVER ??
    "https://testnet-api.algonode.cloud";
  const port = process.env.NEXT_PUBLIC_ALGOD_PORT ?? "443";
  const token = process.env.NEXT_PUBLIC_ALGOD_TOKEN ?? "";

  return new algosdk.Algodv2(token, server, Number(port));
}

export function getOracleAccount() {
  const mnemonic = process.env.ORACLE_WALLET_MNEMONIC;
  if (!mnemonic) {
    throw new Error("Missing ORACLE_WALLET_MNEMONIC in environment variables");
  }

  try {
    return algosdk.mnemonicToSecretKey(mnemonic.trim());
  } catch {
    throw new Error(
      "Invalid ORACLE_WALLET_MNEMONIC. It must be a valid 25-word Algorand mnemonic.",
    );
  }
}

export function getAppId() {
  const raw = process.env.NEXT_PUBLIC_APP_ID;
  if (!raw) {
    throw new Error("Missing NEXT_PUBLIC_APP_ID in environment variables");
  }

  const appId = Number(raw);
  if (!Number.isFinite(appId) || appId <= 0) {
    throw new Error("NEXT_PUBLIC_APP_ID must be a positive number");
  }

  return appId;
}
