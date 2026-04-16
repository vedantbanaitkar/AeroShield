import { NextRequest, NextResponse } from "next/server";
import algosdk from "algosdk";
import { getAlgodClient, getOracleAccount } from "@/lib/algorand";

type TriggerBody = {
  beneficiary: string;
  coverageAmountAlgo: number;
  flightNumber: string;
  appId: number;
  demoMode?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<TriggerBody>;
    const beneficiary = body.beneficiary;
    const flightNumber = body.flightNumber?.toUpperCase();
    const appId = Number(body.appId);
    const coverageAmountAlgo = Number(body.coverageAmountAlgo);
    const demoMode = Boolean(body.demoMode);

    if (!beneficiary || !algosdk.isValidAddress(beneficiary)) {
      return NextResponse.json(
        { error: "Invalid beneficiary address" },
        { status: 400 },
      );
    }

    if (!flightNumber) {
      return NextResponse.json(
        { error: "Missing flightNumber" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(appId) || appId <= 0) {
      return NextResponse.json({ error: "Invalid appId" }, { status: 400 });
    }

    if (!Number.isFinite(coverageAmountAlgo) || coverageAmountAlgo <= 0) {
      return NextResponse.json(
        { error: "Invalid coverageAmountAlgo" },
        { status: 400 },
      );
    }

    const coverageMicroAlgo = Math.round(coverageAmountAlgo * 1_000_000);

    const algod = getAlgodClient();
    const oracle = getOracleAccount();
    const oracleAccountInfo = await algod.accountInformation(oracle.addr).do();
    const oracleBalance = Number(oracleAccountInfo.amount ?? 0);
    const oracleMinBalance = Number(oracleAccountInfo.minBalance ?? 0);
    const oracleSpendable = Math.max(0, oracleBalance - oracleMinBalance);

    if (demoMode) {
      const payoutSp = await algod.getTransactionParams().do();
      const payoutTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: oracle.addr,
        receiver: beneficiary,
        amount: coverageMicroAlgo,
        suggestedParams: {
          ...payoutSp,
          fee: 1000,
          flatFee: true,
        },
      });

      const signedPayout = payoutTxn.signTxn(oracle.sk);
      const payoutResult = await algod.sendRawTransaction(signedPayout).do();
      await algosdk.waitForConfirmation(algod, payoutResult.txid, 4);

      return NextResponse.json({
        success: true,
        txId: payoutResult.txid,
        demoMode: true,
        payoutPath: "demo-direct-payment",
        explorerUrl: `https://testnet.explorer.perawallet.app/tx/${payoutResult.txid}`,
      });
    }

    // Ensure app escrow has enough spendable balance to cover payout.
    const appAddress = algosdk.getApplicationAddress(appId);
    const appAccountInfo = await algod.accountInformation(appAddress).do();
    const appBalance = Number(appAccountInfo.amount ?? 0);
    const appMinBalance = Number(appAccountInfo.minBalance ?? 0);
    const appSpendable = Math.max(0, appBalance - appMinBalance);

    if (appSpendable < coverageMicroAlgo) {
      const deficitMicroAlgo = coverageMicroAlgo - appSpendable;
      const safetyBufferMicroAlgo = 200_000; // 0.2 ALGO buffer for min-balance/fees.
      const topUpAmount = deficitMicroAlgo + safetyBufferMicroAlgo;

      const estimatedOracleSpend = topUpAmount + 3_000;
      if (oracleSpendable < estimatedOracleSpend) {
        return NextResponse.json(
          {
            error:
              `Oracle wallet does not have enough testnet ALGO to fund this payout. ` +
              `Available: ${(oracleSpendable / 1_000_000).toFixed(3)} ALGO, ` +
              `required: ${(estimatedOracleSpend / 1_000_000).toFixed(3)} ALGO. ` +
              `Fund the oracle wallet on testnet and try again.`,
            code: "INSUFFICIENT_ORACLE_FUNDS",
          },
          { status: 400 },
        );
      }

      const topUpSp = await algod.getTransactionParams().do();
      const topUpTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: oracle.addr,
        receiver: appAddress,
        amount: topUpAmount,
        suggestedParams: topUpSp,
      });

      const signedTopUp = topUpTxn.signTxn(oracle.sk);
      const topUpResult = await algod.sendRawTransaction(signedTopUp).do();
      await algosdk.waitForConfirmation(algod, topUpResult.txid, 4);
    }

    const suggestedParams = await algod.getTransactionParams().do();
    const beneficiaryBytes = algosdk.decodeAddress(beneficiary).publicKey;

    const method = algosdk.ABIMethod.fromSignature(
      "triggerPayout(byte[32],uint64,string)void",
    );

    const composer = new algosdk.AtomicTransactionComposer();
    composer.addMethodCall({
      appID: appId,
      method,
      sender: oracle.addr,
      methodArgs: [beneficiaryBytes, BigInt(coverageMicroAlgo), flightNumber],
      suggestedParams: {
        ...suggestedParams,
        fee: 2_000,
        flatFee: true,
      },
      signer: algosdk.makeBasicAccountTransactionSigner(oracle),
    });

    const result = await composer.execute(algod, 3);
    const txId = result.txIDs[0];

    return NextResponse.json({
      success: true,
      txId,
      demoMode,
      explorerUrl: `https://testnet.explorer.perawallet.app/tx/${txId}`,
    });
  } catch (error) {
    console.error("[/api/trigger] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
