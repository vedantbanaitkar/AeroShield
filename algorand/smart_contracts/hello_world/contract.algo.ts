import { Contract } from '@algorandfoundation/algorand-typescript'
import { Account, uint64, GlobalState, Txn, Global, abimethod, assert, gtxn, itxn } from '@algorandfoundation/algorand-typescript'

export class HelloWorld extends Contract {
  oracle = GlobalState<Account>()

  @abimethod({ onCreate: 'require' })
  createApplication(oracleAddr: Account): void {
    this.oracle.value = oracleAddr
  }

  // User submits grouped premium payment + app call
  @abimethod({ allowActions: ['NoOp'] })
  buyPolicy(
    paymentTxn: gtxn.PaymentTxn,
    flightNumber: string,
    coverageAmount: uint64,
    delayThreshold: uint64,
  ): void {
    assert(paymentTxn.sender === Txn.sender)
    assert(paymentTxn.receiver === Global.currentApplicationAddress)
    assert(paymentTxn.amount > 0)
    assert(coverageAmount > 0)
    assert(delayThreshold >= 60)
  }

  // Oracle-only payout trigger
  @abimethod({ allowActions: ['NoOp'] })
  triggerPayout(
    beneficiary: Account,
    coverageAmount: uint64,
    flightNumber: string,
  ): void {
    assert(Txn.sender === this.oracle.value)
    assert(coverageAmount > 0)

    itxn.payment({
      receiver: beneficiary,
      amount: coverageAmount,
      fee: 0,
    }).submit()
  }
}
