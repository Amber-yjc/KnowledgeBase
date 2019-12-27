ALTER TABLE user
DROP COLUMN `username`,
ADD UNIQUE INDEX `email_UNIQUE` (`email` ASC),
DROP INDEX `username`;