/*
  Warnings:

  - You are about to drop the column `cartStatusId` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the `CartStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_cartStatusId_fkey";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "cartStatusId";

-- DropTable
DROP TABLE "CartStatus";
