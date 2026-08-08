CREATE TABLE `communication_consent_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`channel` text NOT NULL,
	`purpose` text NOT NULL,
	`action` text NOT NULL,
	`policy_version` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `communication_consent_user_timeline_idx` ON `communication_consent_events` (`user_id`,`channel`,`purpose`,`created_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `whatsapp_transactional_opt_in_at` integer;