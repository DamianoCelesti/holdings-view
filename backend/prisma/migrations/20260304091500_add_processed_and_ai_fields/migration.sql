-- Extend the status lifecycle and persist AI classification data
ALTER TABLE `RawPost`
  MODIFY `status` ENUM('NEW', 'PROCESSED', 'DISMISSED', 'SAVED') NOT NULL DEFAULT 'NEW',
  ADD COLUMN `processedAt` DATETIME(3) NULL,
  ADD COLUMN `aiIsRelevant` BOOLEAN NULL,
  ADD COLUMN `aiImportance` INTEGER NULL,
  ADD COLUMN `aiCategory` VARCHAR(191) NULL,
  ADD COLUMN `aiTickers` JSON NULL,
  ADD COLUMN `aiReason` LONGTEXT NULL;
