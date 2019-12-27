CREATE TABLE `like` (
  `like_id` INT NOT NULL AUTO_INCREMENT,
  `fromUser` INT NOT NULL,
  `toUser` INT NOT NULL,
  PRIMARY KEY (`like_id`),
  INDEX `from_user_idx` (`fromUser` ASC),
  INDEX `to_user_idx` (`toUser` ASC),
  CONSTRAINT `from_user`
    FOREIGN KEY (`fromUser`)
    REFERENCES user (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `to_user`
    FOREIGN KEY (`toUser`)
    REFERENCES user (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);