/*
  Warnings:

  - Added the required column `chainId` to the `LivePlugs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LivePlugs" ADD COLUMN     "chainId" INTEGER NOT NULL;
