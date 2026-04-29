/*
  Warnings:

  - Made the column `name` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `inviteCode` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "inviteCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "companyId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
