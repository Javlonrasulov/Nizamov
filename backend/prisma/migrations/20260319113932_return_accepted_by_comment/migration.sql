-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Return" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdByUserId" TEXT NOT NULL,
    "acceptedByUserId" TEXT,
    "acceptedAt" DATETIME,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Return_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Return_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Return_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Return" ("clientId", "createdAt", "createdByUserId", "date", "id", "orderId", "status") SELECT "clientId", "createdAt", "createdByUserId", "date", "id", "orderId", "status" FROM "Return";
DROP TABLE "Return";
ALTER TABLE "new_Return" RENAME TO "Return";
CREATE INDEX "Return_clientId_idx" ON "Return"("clientId");
CREATE INDEX "Return_orderId_idx" ON "Return"("orderId");
CREATE INDEX "Return_date_idx" ON "Return"("date");
CREATE INDEX "Return_status_idx" ON "Return"("status");
CREATE INDEX "Return_createdAt_idx" ON "Return"("createdAt");
CREATE INDEX "Return_createdByUserId_idx" ON "Return"("createdByUserId");
CREATE INDEX "Return_acceptedByUserId_idx" ON "Return"("acceptedByUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
