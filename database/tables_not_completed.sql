-- Active: 1717372720993@@localhost@3306@app
 --Active: 1715561308869@@127.0.0.1@3306@app
select *from users;
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

create table chats(
	id_chat int primary key auto_increment,
	id_user1 int not null,	
    id_user2 int not null,
    data_criacao timestamp,
    foreign key (id_user1) references Users (id_user),
    foreign key (id_user2) references Users (id_user))