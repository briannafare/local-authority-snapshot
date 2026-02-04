-- Add new fields for premium upgrade features
-- Overall scores for teaser/full report system
ALTER TABLE `audits` ADD COLUMN `overallGrade` enum('A','B','C','D','F');
ALTER TABLE `audits` ADD COLUMN `overallScore` int;
ALTER TABLE `audits` ADD COLUMN `fullReportUnlocked` int DEFAULT 0;

-- GeoGrid and deep competitor analysis data
ALTER TABLE `audits` ADD COLUMN `geoGridData` text;
ALTER TABLE `audits` ADD COLUMN `deepCompetitorAnalysis` text;

-- Go High Level integration
ALTER TABLE `audits` ADD COLUMN `ghlContactId` varchar(100);
ALTER TABLE `audits` ADD COLUMN `ghlWorkflowTriggered` int DEFAULT 0;
