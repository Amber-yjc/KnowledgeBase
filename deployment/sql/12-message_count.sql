ALTER TABLE user
ADD COLUMN `message_count` INT NOT NULL DEFAULT 0 AFTER `like_count`;