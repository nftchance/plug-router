/*
  Warnings:

  - You are about to drop the `Execution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LivePlugs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Plugs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Execution" DROP CONSTRAINT "Execution_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Execution" DROP CONSTRAINT "Execution_plugsId_fkey";

-- DropForeignKey
ALTER TABLE "LivePlugs" DROP CONSTRAINT "LivePlugs_plugsId_fkey";

-- DropTable
DROP TABLE "Execution";

-- DropTable
DROP TABLE "LivePlugs";

-- DropTable
DROP TABLE "Plugs";

-- CreateTable
CREATE TABLE "Intent" (
    "id" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "solver" TEXT NOT NULL,
    "actions" TEXT[],
    "signer" TEXT NOT NULL,
    "signature" TEXT NOT NULL,

    CONSTRAINT "Intent_pkey" PRIMARY KEY ("id")
);
