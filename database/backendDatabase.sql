CREATE DATABASE BACKEND;
USE BACKEND;
CREATE TABLE users(
	id int primary key AUTO_INCREMENT,
	username varchar(25) unique not null,
    _password varchar(70) not null,
    email varchar(25) unique not null,
    _role enum('admin', 'user') default 'user' not null,
    otp int,
    otp_expire_time datetime,
    created_at datetime default current_timestamp
);
CREATE TABLE items(
	id int primary key AUTO_INCREMENT,
    name varchar(30) not null,
    description varchar(250) not null,
    starting_price float not null,
    current_price float,
    image_url varchar(30),
    end_time datetime not null,
    created_at datetime default current_timestamp,
    owner_id int not null,
    foreign key(owner_id) references users(id)
);


-- DROP table items;


DROP TRIGGER IF EXISTS set_current_price_before_update;

DELIMITER //
-- for updating the entries--  
CREATE TRIGGER set_current_price_before_update
BEFORE UPDATE ON items
FOR EACH ROW
BEGIN
    IF NEW.starting_price IS NOT NULL AND NEW.starting_price <> OLD.starting_price THEN
        SET NEW.current_price = NEW.starting_price;
    END IF;
END //

-- for inserting a new entry-- 
CREATE TRIGGER set_current_price_before_insert
BEFORE INSERT ON items
FOR EACH ROW
BEGIN
    SET NEW.current_price = NEW.starting_price;
END //
DELIMITER ;

CREATE TABLE bids(
	id int primary key AUTO_INCREMENT,
    item_id int,
    user_id int,
    bid_amount float not null,
    created_at datetime default current_timestamp,
    foreign key(item_id) references items(id),
    foreign key(user_id) references users(id)
    );

CREATE TABLE notifications(
	id int primary key AUTO_INCREMENT,
    user_id int not null,
    message varchar(250) not null,
    is_read boolean default false,
    created_at datetime default current_timestamp,
    foreign key(user_id) references users(id)
);


