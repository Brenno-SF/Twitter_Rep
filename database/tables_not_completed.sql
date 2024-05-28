-- Active: 1715561308869@@127.0.0.1@3306@app
CREATE DATABASE app;

USE app;

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

INSERT INTO
    `Users` (user_name, hash_password)
VALUES ("@Teste", "Test@Hashing");

INSERT INTO Emails (email, fk_user) VALUES ("test@email.com", 1);

INSERT INTO
    `Thoughts` (content, fk_user)
VALUES ('Pensamento de teste', 1);

UPDATE `Users`
SET
    user_name = 'New_user_name'
WHERE
    id_user = 1;

UPDATE `Thoughts`
SET
    content = 'new content'
WHERE
    id_thought = 1;

UPDATE `Emails`
SET
    email = 'NewTestEmail@email.com'
WHERE
    id_email = 1;