/** creating users */

CREATE DATABASE `horatio_fox` /*!40100 DEFAULT CHARACTER SET utf8 */;

CREATE TABLE `horatio_fox`.`users` (
  `id` INT NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `first_name` VARCHAR(45) NULL,
  `last_name` VARCHAR(45) NULL,
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_log_in` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `avatar_img` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC));


  ALTER TABLE `horatio_fox`.`users`
  ADD COLUMN `username` VARCHAR(45) NOT NULL AFTER `id`,
  ADD UNIQUE INDEX `username_UNIQUE` (`username` ASC);


  ALTER TABLE `horatio_fox`.`users`
CHANGE COLUMN `email` `email` VARCHAR(45) NOT NULL AFTER `id`,
CHANGE COLUMN `id` `id` INT(11) NOT NULL AUTO_INCREMENT ,
ADD COLUMN `password` VARCHAR(45) NOT NULL AFTER `username`,
ADD COLUMN `active` INT(1) NOT NULL DEFAULT 0 AFTER `avatar_img`,
ADD COLUMN `token` VARCHAR(45) NULL COMMENT 'email verification token' AFTER `active`;

ALTER TABLE `horatio_fox`.`users`
ADD COLUMN `name` VARCHAR(91) GENERATED ALWAYS AS (first_name + ' '  + last_name) VIRTUAL AFTER `last_name`;

ALTER TABLE `horatio_fox`.`users`
CHANGE COLUMN `last_log_in` `last_login` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ;

ALTER TABLE `horatio_fox`.`users`
CHANGE COLUMN `password` `password` VARCHAR(255) NOT NULL ;
