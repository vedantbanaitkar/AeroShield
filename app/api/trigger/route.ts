import { NextRequest, NextResponse } from "next/server";
import algosdk from "algosdk";
import { getAlgodClient, getOracleAccount } from "@/lib/algorand";

type TriggerBody = {
  beneficiary: string;
  coverageAmountAlgo: number;
  flightNumber: string;
  appId: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<TriggerBody>;
    const beneficiary = body.beneficiary;
    const flightNumber = body.flightNumber?.toUpperCase();
    const appId = Number(body.appId);
    const coverageAmountAlgo = Number(body.coverageAmountAlgo);

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
    const suggestedParams = await algod.getTransactionParams().do();

    const method = algosdk.ABIMethod.fromSignature(
      "triggerPayout(address,uint64,string)void",
    );

    const composer = new algosdk.AtomicTransactionComposer();
    composer.addMethodCall({
      appID: appId,
      method,
      sender: oracle.addr,
      methodArgs: [beneficiary, BigInt(coverageMicroAlgo), flightNumber],
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
      explorerUrl: `https://testnet.explorer.perawallet.app/tx/${txId}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
