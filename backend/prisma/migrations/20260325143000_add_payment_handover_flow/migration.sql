-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "receivedBySkladUserId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "receivedBySkladAt" DATETIME;
ALTER TABLE "Payment" ADD COLUMN "receivedByAdminUserId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "receivedByAdminAt" DATETIME;

-- Backfill existing payments as already processed so historical reports stay unchanged.
UPDATE "Payment"
SET
  "receivedBySkladAt" = "createdAt",
  "receivedByAdminAt" = "createdAt";

-- CreateIndex
CREATE INDEX "Payment_receivedBySkladUserId_idx" ON "Payment"("receivedBySkladUserId");

-- CreateIndex
CREATE INDEX "Payment_receivedBySkladAt_idx" ON "Payment"("receivedBySkladAt");

-- CreateIndex
CREATE INDEX "Payment_receivedByAdminUserId_idx" ON "Payment"("receivedByAdminUserId");

-- CreateIndex
CREATE INDEX "Payment_receivedByAdminAt_idx" ON "Payment"("receivedByAdminAt");
