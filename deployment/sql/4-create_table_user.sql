DROP TABLE IF EXISTS user;
CREATE TABLE user(
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    firstname VARCHAR(32) NOT NULL,
    lastname VARCHAR(32) NOT NULL,
    email VARCHAR(64) NOT NULL,
    img_url VARCHAR(256) NOT NULL,
    description VARCHAR(1024),
    country VARCHAR(32),
    birth_date TIMESTAMP NOT NULL,
    like_count INT DEFAULT 0 NOT NULL,
    PRIMARY KEY (id)

)