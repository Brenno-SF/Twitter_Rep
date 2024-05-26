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