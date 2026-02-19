-- AlterTable
ALTER TABLE `rawpost` ADD COLUMN `firstSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` ENUM('NEW', 'DISMISSED', 'SAVED') NOT NULL DEFAULT 'NEW',
    ADD COLUMN `statusAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `RawPost_status_idx` ON `RawPost`(`status`);
