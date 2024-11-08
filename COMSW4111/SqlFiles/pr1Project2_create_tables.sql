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
	user_id VARCHAR(50) PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
	password CHAR(20) NOT NULL,
	address TEXT NOT NULL,
	phone_number VARCHAR(30) CHECK (phone_number ~ '^\+?[0-9\-\s\(\)]+$'),
	t_created TIMESTAMP,
	t_last_act TIMESTAMP,
	acc_status VARCHAR(20) CHECK (acc_status IN ('active', 'inactive', 'banned'))
);

CREATE TABLE ACCOUNT (
	account_id VARCHAR(50) PRIMARY KEY,
	user_id VARCHAR(50) REFERENCES PRUSER(user_id),
	account_type VARCHAR(50) CHECK (account_type in ('bank_account', 'credit_card')),
	billing_address TEXT NOT NULL
);

CREATE TABLE SELLER (
	seller_id VARCHAR(50) REFERENCES PRUSER(user_id) ,
	account_id VARCHAR(50) REFERENCES ACCOUNT(account_id),
	PRIMARY KEY (seller_id)
);

CREATE TABLE BUYER (
	buyer_id VARCHAR(50) REFERENCES PRUSER(user_id),
	account_id VARCHAR(50) REFERENCES ACCOUNT(account_id),
	PRIMARY KEY (buyer_id)
);

CREATE TABLE ADMIN (
	admin_id VARCHAR(50) REFERENCES PRUSER(user_id),
	admin_role VARCHAR(50) NOT NULL,
	PRIMARY KEY (admin_id)
);

CREATE TABLE BANKACCOUNT (
	account_id VARCHAR(50) REFERENCES ACCOUNT(account_id),
	bank_acc_num VARCHAR(30),
	routing_num VARCHAR(50),
	PRIMARY KEY(account_id)
);

CREATE TABLE CREDITCARD(
	account_id VARCHAR(50) REFERENCES ACCOUNT(account_id),
	cc_num VARCHAR(30),
	exp_date DATE,
	PRIMARY KEY(account_id)
);

CREATE TABLE LOCATION (
	location_id VARCHAR(50) PRIMARY KEY,
	longitude TEXT,
	latitude TEXT,
	zip_code VARCHAR(15),
	address TEXT,
	building_image TEXT
);

CREATE TABLE LISTING (
	listing_id VARCHAR(50) PRIMARY KEY,
	seller_id VARCHAR(50) REFERENCES SELLER(seller_id),
	title VARCHAR(255) NOT NULL,
	description TEXT,
	price DECIMAL(10, 2) NOT NULL,
	list_image TEXT,
	location_id VARCHAR(50) REFERENCES LOCATION(location_id),
	meta_tag TEXT,
	t_created TIMESTAMP,
	t_last_edit TIMESTAMP

);

CREATE TABLE TRANSACTION (
	transaction_id VARCHAR(50) PRIMARY KEY,
	buyer_id VARCHAR(50) REFERENCES BUYER(buyer_id),
	seller_id VARCHAR(50) REFERENCES SELLER(seller_id),
	listing_id VARCHAR(50) REFERENCES LISTING(listing_id),
	t_date DATE,
	agreed_price DECIMAL(10, 2) NOT NULL,
	serv_fee DECIMAL(10, 2),
	status VARCHAR(20) CHECK (status IN ('pending', 'confirming', 'confirmed', 'completed')) NOT NULL
);

CREATE TABLE DISPUTE (
	dispute_id VARCHAR(50) PRIMARY KEY,
	transaction_id VARCHAR(50) REFERENCES TRANSACTION(transaction_id),
	admin_id VARCHAR(50) REFERENCES ADMIN(admin_id),
	description TEXT NOT NULL,
	status VARCHAR(50) CHECK(status IN ('solved', 'unsolved')) NOT NULL,
	resolution_date DATE
);