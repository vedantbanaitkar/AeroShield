-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" VARCHAR(58) NOT NULL,
    "productId" VARCHAR(20) NOT NULL,
    "coverage" INTEGER NOT NULL,
    "premium" INTEGER NOT NULL,
    "buyTxId" TEXT NOT NULL,
    "lastOracleCheckTxId" TEXT,
    "payoutTxId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "delayMinutes" INTEGER,
    "lastOracleCheckAt" TIMESTAMP(3),
    "payoutTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_buyTxId_key" UNIQUE("buyTxId"),
    CONSTRAINT "Policy_payoutTxId_key" UNIQUE("payoutTxId")
);

-- CreateTable
CREATE TABLE "WalletSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" VARCHAR(58) NOT NULL UNIQUE,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE INDEX "Policy_walletAddress_idx" ON "Policy"("walletAddress");

-- CreateIndex
CREATE INDEX "Policy_status_idx" ON "Policy"("status");

-- CreateIndex
CREATE INDEX "WalletSession_walletAddress_idx" ON "WalletSession"("walletAddress");

-- CreateIndex
CREATE INDEX "WalletSession_isActive_idx" ON "WalletSession"("isActive");
