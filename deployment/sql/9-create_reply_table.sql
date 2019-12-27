CREATE TABLE reply (
  `reply_id` INT NOT NULL AUTO_INCREMENT,
  `replier_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  `text` VARCHAR(500) NOT NULL,
  `date` TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (`reply_id`),
  INDEX `replier_id_idx` (`replier_id` ASC),
  CONSTRAINT `replier_id`
    FOREIGN KEY (`replier_id`)
    REFERENCES user (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_id`
    FOREIGN KEY (`post_id`)
    REFERENCES post (`post_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE post
ADD COLUMN `reply_count` INT NOT NULL DEFAULT 0 AFTER `author_id`;