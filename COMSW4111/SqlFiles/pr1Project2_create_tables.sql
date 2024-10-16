DROP TABLE DISPUTE;
DROP TABLE TRANSACTION;
DROP TABLE LISTING;
DROP TABLE LOCATION;
DROP TABLE CREDITCARD;
DROP TABLE BANKACCOUNT;
DROP TABLE ADMIN;
DROP TABLE BUYER;
DROP TABLE SELLER;
DROP TABLE ACCOUNT;
DROP TABLE PRUSER;

CREATE TABLE PRUSER (
	user_id SERIAL PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	password CHAR(20) NOT NULL,
	address TEXT NOT NULL,
	phone_number INT,
	t_created TIMESTAMP,
	t_last_act TIMESTAMP,
	acc_status VARCHAR(20) CHECK (acc_status IN ('active', 'inactive', 'banned'))
);

CREATE TABLE ACCOUNT (
account_id SERIAL PRIMARY KEY,
user_id INT REFERENCES PRUSER(user_id),
account_type VARCHAR(50) CHECK (account_type in ('bank_account', 'credit_card')),
billing_address TEXT NOT NULL
);


CREATE TABLE SELLER (
seller_id INT REFERENCES PRUSER(user_id) ,
account_id INT REFERENCES ACCOUNT(account_id),
PRIMARY KEY (seller_id)
);


CREATE TABLE BUYER (
buyer_id INT REFERENCES PRUSER(user_id),
account_id INT REFERENCES ACCOUNT(account_id),
PRIMARY KEY (buyer_id)
);
CREATE TABLE ADMIN (
admin_id INT REFERENCES PRUSER(user_id),
admin_role VARCHAR(50) NOT NULL,
PRIMARY KEY (admin_id)
);



CREATE TABLE BANKACCOUNT (
account_id INT REFERENCES ACCOUNT(account_id),
bank_acc_num VARCHAR(30),
routing_num VARCHAR(50),
PRIMARY KEY(account_id)
);

CREATE TABLE CREDITCARD(
account_id INT REFERENCES ACCOUNT(account_id),
cc_num VARCHAR(30),
exp_date DATE,
PRIMARY KEY(account_id)
);


CREATE TABLE LOCATION (
location_id SERIAL PRIMARY KEY,
longitude TEXT,
latitude TEXT,
zip_code VARCHAR(15),
address TEXT,
building_image TEXT
);

CREATE TABLE LISTING (
	listing_id SERIAL PRIMARY KEY,
	seller_id INT REFERENCES SELLER(seller_id),
	title VARCHAR(255) NOT NULL,
	description TEXT,
	price DECIMAL(10, 2) NOT NULL,
	list_image TEXT,
	location_id INT REFERENCES LOCATION(location_id),
	meta_tag TEXT,
	t_created TIMESTAMP,
	t_last_edit TIMESTAMP

);



CREATE TABLE TRANSACTION (
transaction_id SERIAL PRIMARY KEY,
buyer_id INT REFERENCES BUYER(buyer_id),
seller_id INT REFERENCES SELLER(seller_id),
listing_id INT REFERENCES LISTING(listing_id),
t_date DATE,
agreed_price DECIMAL(10, 2) NOT NULL,
serv_fee DECIMAL(10, 2),
status VARCHAR(20) CHECK (status IN ('pending', 'confirming', 'confirmed', 'completed' )) NOT
NULL
);

CREATE TABLE DISPUTE (
dispute_id SERIAL PRIMARY KEY,
transaction_id INT REFERENCES TRANSACTION(transaction_id),
admin_id INT REFERENCES ADMIN(admin_id),
description TEXT NOT NULL,
status VARCHAR(50) CHECK(status IN ('solved', 'unsolved')) NOT NULL,
resolution_date DATE
);