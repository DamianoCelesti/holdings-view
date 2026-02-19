/*
  Warnings:

  - You are about to drop the column `author` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `createdUtc` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `fetchedAt` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `numComments` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `permalink` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `redditId` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `selftext` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `subreddit` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `savedpost` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `savedpost` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rawPostId]` on the table `SavedPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rawPostId` to the `SavedPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SavedPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `SavedPost_redditId_key` ON `savedpost`;

-- AlterTable
ALTER TABLE `savedpost` DROP COLUMN `author`,
    DROP COLUMN `createdUtc`,
    DROP COLUMN `fetchedAt`,
    DROP COLUMN `numComments`,
    DROP COLUMN `permalink`,
    DROP COLUMN `redditId`,
    DROP COLUMN `score`,
    DROP COLUMN `selftext`,
    DROP COLUMN `subreddit`,
    DROP COLUMN `title`,
    DROP COLUMN `url`,
    ADD COLUMN `rawPostId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SavedPost_rawPostId_key` ON `SavedPost`(`rawPostId`);

-- AddForeignKey
ALTER TABLE `SavedPost` ADD CONSTRAINT `SavedPost_rawPostId_fkey` FOREIGN KEY (`rawPostId`) REFERENCES `RawPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
