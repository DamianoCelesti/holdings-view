-- Add UNCERTAIN status and main AI output fields for manual processing
ALTER TABLE `RawPost`
  MODIFY `status` ENUM('NEW', 'UNCERTAIN', 'PROCESSED', 'DISMISSED', 'SAVED') NOT NULL DEFAULT 'NEW';

ALTER TABLE `RawPost`
  ADD COLUMN `aiSummaryMd` LONGTEXT NULL,
  ADD COLUMN `aiScore` INTEGER NULL,
  ADD COLUMN `aiDataJson` JSON NULL;
