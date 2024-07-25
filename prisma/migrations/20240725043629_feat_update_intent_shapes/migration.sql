/*
  Warnings:

  - You are about to drop the `Intent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Intent";

-- CreateTable
CREATE TABLE "Plug" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "target" TEXT NOT NULL,
    "value" BIGINT NOT NULL,
    "data" BYTEA NOT NULL,
    "plugsId" TEXT,

    CONSTRAINT "Plug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plugs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "socket" TEXT NOT NULL,
    "solver" TEXT NOT NULL,
    "salt" BYTEA NOT NULL,

    CONSTRAINT "Plugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivePlugs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "signer" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "plugsId" TEXT NOT NULL,

    CONSTRAINT "LivePlugs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Plug_plugsId_idx" ON "Plug"("plugsId");

-- CreateIndex
CREATE INDEX "LivePlugs_plugsId_idx" ON "LivePlugs"("plugsId");

-- AddForeignKey
ALTER TABLE "Plug" ADD CONSTRAINT "Plug_plugsId_fkey" FOREIGN KEY ("plugsId") REFERENCES "Plugs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivePlugs" ADD CONSTRAINT "LivePlugs_plugsId_fkey" FOREIGN KEY ("plugsId") REFERENCES "Plugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
