import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { HelloWorldFactory } from "../artifacts/hello_world/HelloWorldClient";
import algosdk from "algosdk";

export async function deploy() {
  console.log("=== Deploying HelloWorld ===");

  const algorand = AlgorandClient.fromEnvironment();
  const deployer = await algorand.account.fromEnvironment("DEPLOYER");

  const oracleMnemonic = process.env.ORACLE_MNEMONIC;
  const oracleAddr = oracleMnemonic
    ? algosdk.mnemonicToSecretKey(oracleMnemonic).addr
    : deployer.addr;

  const appName = "HelloWorldV5";

  console.log(`App Name: ${appName}`);
  console.log(`Oracle Address: ${oracleAddr}`);

  const factory = algorand.client.getTypedAppFactory(HelloWorldFactory, {
    defaultSender: deployer.addr,
    appName,
  });

  try {
    const { appClient, result } = await factory.deploy({
      appName,
      onUpdate: "replace",
      onSchemaBreak: "replace",
      createParams: {
        method: "createApplication",
        args: {
          oracleAddr: oracleAddr.toString(),
        },
      },
    });

    console.log(`\n✅ Deployed app: ${appClient.appClient.appName}`);
    console.log(`App ID: ${appClient.appClient.appId}`);
    console.log(`App Address: ${appClient.appAddress}`);
    console.log(`Oracle Address: ${oracleAddr}`);
    console.log(
      `\n⚠️  Update your .env.local: NEXT_PUBLIC_APP_ID=${appClient.appClient.appId}`,
    );
  } catch (error) {
    console.error(
      "Deployment error:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}
