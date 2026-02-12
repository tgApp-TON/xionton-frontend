-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'FOUNDER', 'PARTNER', 'USER');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('INSTANT', 'BATCH');

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('PAID_OUT', 'PENDING_PAYOUT', 'HELD_FOR_AUTOPURCHASE', 'PLATFORM_INCOME');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "telegramUsername" TEXT,
    "telegramPhone" TEXT,
    "isPremium" BOOLEAN NOT NULL,
    "accountCreatedDate" TIMESTAMP(3) NOT NULL,
    "nickname" VARCHAR(20) NOT NULL,
    "tonWallet" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "referrerId" INTEGER,
    "referralCode" VARCHAR(10),
    "directReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalNetwork" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DECIMAL(20,9) NOT NULL DEFAULT 0,
    "totalInvested" DECIMAL(20,9) NOT NULL DEFAULT 0,
    "pendingPayout" DECIMAL(20,9) NOT NULL DEFAULT 0,
    "payoutMethod" "PayoutMethod" NOT NULL DEFAULT 'BATCH',
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "fraudScore" INTEGER NOT NULL DEFAULT 0,
    "ipAddress" TEXT,
    "deviceInfo" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'ACTIVE',
    "cycleNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TablePosition" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "partnerUserId" INTEGER NOT NULL,
    "partnerNickname" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "amountPaid" DECIMAL(20,9) NOT NULL,
    "amountReceived" DECIMAL(20,9) NOT NULL,
    "fee" DECIMAL(20,9),
    "status" "PositionStatus" NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "TablePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "txHash" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amount" DECIMAL(20,9) NOT NULL,
    "fee" DECIMAL(20,9) NOT NULL,
    "type" TEXT NOT NULL,
    "tableNumber" INTEGER,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "amount" DECIMAL(20,9),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalEarned" DECIMAL(20,9) NOT NULL DEFAULT 0,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "table1Cycles" INTEGER NOT NULL DEFAULT 0,
    "table2Cycles" INTEGER NOT NULL DEFAULT 0,
    "table3Cycles" INTEGER NOT NULL DEFAULT 0,
    "table4Cycles" INTEGER NOT NULL DEFAULT 0,
    "table5Cycles" INTEGER NOT NULL DEFAULT 0,
    "table6Cycles" INTEGER NOT NULL DEFAULT 0,
    "table7Cycles" INTEGER NOT NULL DEFAULT 0,
    "table8Cycles" INTEGER NOT NULL DEFAULT 0,
    "table9Cycles" INTEGER NOT NULL DEFAULT 0,
    "table10Cycles" INTEGER NOT NULL DEFAULT 0,
    "table11Cycles" INTEGER NOT NULL DEFAULT 0,
    "table12Cycles" INTEGER NOT NULL DEFAULT 0,
    "totalCycles" INTEGER NOT NULL DEFAULT 0,
    "activeTables" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerConfig" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "autoActivateTables" INTEGER[],
    "activationTrigger" TEXT NOT NULL DEFAULT 'first_table_purchase',
    "tablesActivated" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingPayout" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL(20,9) NOT NULL,
    "reason" TEXT NOT NULL,
    "tableNumber" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payoutMethod" "PayoutMethod" NOT NULL,
    "batchId" INTEGER,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PendingPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "User_tonWallet_key" ON "User"("tonWallet");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "Table_status_tableNumber_idx" ON "Table"("status", "tableNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Table_userId_tableNumber_key" ON "Table"("userId", "tableNumber");

-- CreateIndex
CREATE INDEX "TablePosition_tableId_position_idx" ON "TablePosition"("tableId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_toAddress_createdAt_idx" ON "Transaction"("toAddress", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_type_tableNumber_idx" ON "Transaction"("type", "tableNumber");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerConfig_userId_key" ON "PartnerConfig"("userId");

-- CreateIndex
CREATE INDEX "PendingPayout_userId_status_idx" ON "PendingPayout"("userId", "status");

-- CreateIndex
CREATE INDEX "PendingPayout_status_payoutMethod_idx" ON "PendingPayout"("status", "payoutMethod");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablePosition" ADD CONSTRAINT "TablePosition_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerConfig" ADD CONSTRAINT "PartnerConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingPayout" ADD CONSTRAINT "PendingPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
