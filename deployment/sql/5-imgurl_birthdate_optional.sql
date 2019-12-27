ALTER TABLE user
CHANGE COLUMN `img_url` `img_url` VARCHAR(256) NULL DEFAULT 'https://www.drupal.org/files/issues/default-avatar.png' ,
CHANGE COLUMN `birth_date` `birth_date` TIMESTAMP NULL ;