-- Active: 1715561308869@@127.0.0.1@3306@app

use app;

CREATE TABLE Users (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(64) UNIQUE,
    hash_password VARCHAR(64) NOT NULL,
    created_at DATE DEFAULT(CURDATE())
);

CREATE TABLE Thoughts (
    id_thought INT PRIMARY KEY AUTO_INCREMENT,
    likes INT DEFAULT 0,
    content VARCHAR(144) NOT NULL,
    fk_user INT,
    created_at DATE DEFAULT(CURDATE()),
    FOREIGN KEY (fk_user) REFERENCES Users (id_user)
);

CREATE TABLE Emails (
    id_email INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(128) UNIQUE NOT NULL,
    fk_user INT,
    FOREIGN KEY (fk_user) REFERENCES Users (id_user)
);

RENAME TABLE Users TO users,
Thoughts TO thoughts,
Emails TO emails;

create table Talk (
    id_talk int PRIMARY KEY auto_increment,
    id_sender INT NOT NULL,
    id_receiver INT NOT NULL,
    Foreign Key (id_sender) REFERENCES Users(id_user),
    Foreign Key (id_receiver) REFERENCES Users(id_user),
    sending_time TIMESTAMP);
SELECT *from Talk