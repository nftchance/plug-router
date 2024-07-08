/*
  Warnings:

  - Added the required column `clientId` to the `Execution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Execution" ADD COLUMN     "clientId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
