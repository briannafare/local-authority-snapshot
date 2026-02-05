ALTER TABLE `audits` ADD `overallGrade` enum('A','B','C','D','F');--> statement-breakpoint
ALTER TABLE `audits` ADD `overallScore` int;--> statement-breakpoint
ALTER TABLE `audits` ADD `fullReportUnlocked` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `audits` ADD `geoGridData` text;--> statement-breakpoint
ALTER TABLE `audits` ADD `deepCompetitorAnalysis` text;--> statement-breakpoint
ALTER TABLE `audits` ADD `ghlContactId` varchar(100);--> statement-breakpoint
ALTER TABLE `audits` ADD `ghlWorkflowTriggered` int DEFAULT 0;