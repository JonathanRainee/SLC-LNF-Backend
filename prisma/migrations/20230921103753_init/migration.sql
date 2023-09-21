/*
  Warnings:

  - You are about to drop the column `founDate` on the `item` table. All the data in the column will be lost.
  - Added the required column `foundDate` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `item` DROP COLUMN `founDate`,
    ADD COLUMN `foundDate` DATETIME(3) NOT NULL;
