CREATE TABLE post (
  `post_id` INT NOT NULL AUTO_INCREMENT,
  `subject` VARCHAR(100) NOT NULL,
  `text` VARCHAR(500) NOT NULL,
  `topic` VARCHAR(50) NOT NULL,
  `date` TIMESTAMP(6) NOT NULL,
  `author_id` INT NOT NULL,
  PRIMARY KEY (`post_id`),
  UNIQUE INDEX `post_id_UNIQUE` (`post_id` ASC),
  INDEX `author_id_idx` (`author_id` ASC),
  INDEX `topic` (`topic` ASC),
  CONSTRAINT `author_id`
    FOREIGN KEY (`author_id`)
    REFERENCES user (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
