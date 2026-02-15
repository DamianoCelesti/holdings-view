-- CreateTable
CREATE TABLE `RawPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `redditId` VARCHAR(191) NOT NULL,
    `subreddit` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NULL,
    `url` VARCHAR(191) NOT NULL,
    `permalink` VARCHAR(191) NOT NULL,
    `selftext` LONGTEXT NULL,
    `score` INTEGER NULL,
    `numComments` INTEGER NULL,
    `createdUtc` DATETIME(3) NULL,
    `fetchedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RawPost_redditId_key`(`redditId`),
    INDEX `RawPost_subreddit_idx`(`subreddit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `redditId` VARCHAR(191) NOT NULL,
    `subreddit` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NULL,
    `url` VARCHAR(191) NOT NULL,
    `permalink` VARCHAR(191) NOT NULL,
    `selftext` LONGTEXT NULL,
    `score` INTEGER NULL,
    `numComments` INTEGER NULL,
    `createdUtc` DATETIME(3) NULL,
    `fetchedAt` DATETIME(3) NOT NULL,
    `savedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `summaryMd` LONGTEXT NOT NULL,

    UNIQUE INDEX `SavedPost_redditId_key`(`redditId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
