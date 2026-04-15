import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { HelloWorldFactory } from '../artifacts/hello_world/HelloWorldClient'
import algosdk from 'algosdk'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('=== Deploying HelloWorld ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  const oracleMnemonic = process.env.ORACLE_MNEMONIC
  const oracleAddr = oracleMnemonic ? algosdk.mnemonicToSecretKey(oracleMnemonic).addr : deployer.addr

  const factory = algorand.client.getTypedAppFactory(HelloWorldFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient, result } = await factory.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
    createParams: {
      method: 'createApplication',
      args: {
        oracleAddr,
      },
    },
  })

  // If app was just created fund the app account
  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (5).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
  }

  console.log(`Deployed app: ${appClient.appClient.appName}`)
  console.log(`App ID: ${appClient.appClient.appId}`)
  console.log(`App Address: ${appClient.appAddress}`)
  console.log(`Oracle Address: ${oracleAddr}`)
}
