/*
  Warnings:

  - A unique constraint covering the columns `[selectedBidId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('OPEN', 'ASSIGNED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "selectedBidId" INTEGER,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'OPEN';

-- CreateIndex
CREATE UNIQUE INDEX "Project_selectedBidId_key" ON "Project"("selectedBidId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_selectedBidId_fkey" FOREIGN KEY ("selectedBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
