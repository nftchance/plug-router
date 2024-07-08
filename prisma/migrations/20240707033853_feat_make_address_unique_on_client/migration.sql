/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Client_address_key" ON "Client"("address");
