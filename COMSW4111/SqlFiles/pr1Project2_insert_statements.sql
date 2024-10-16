INSERT INTO PRUSER (first_name, last_name, email, password, address, phone_number, t_created, t_last_act, acc_status)
VALUES
('Tony', 'Stark', 'tony.stark@example.com', 'ironman123', '200 Stark Tower', 1234567000, NOW(), NOW(), 'active'),
('Bruce', 'Wayne', 'bruce.wayne@example.com', 'darkknight321', '201 Wayne Manor', 1234567001, NOW(), NOW(), 'inactive'),
('Clark', 'Kent', 'clark.kent@example.com', 'superman321', '202 Kent Farm', 1234567002, NOW(), NOW(), 'active'),
('Diana', 'Prince', 'diana.prince@example.com', 'wonderwoman321', '203 Themyscira St', 1234567003, NOW(), NOW(), 'active'),
('Steve', 'Rogers', 'steve.rogers@example.com', 'captain123', '204 Brooklyn Heights', 1234567004, NOW(), NOW(), 'banned'),
('Natasha', 'Romanoff', 'natasha.romanoff@example.com', 'blackwidow123', '205 Red Room', 1234567005, NOW(), NOW(), 'inactive'),
('Peter', 'Parker', 'peter.parker@example.com', 'spidey321', '206 Queens St', 1234567006, NOW(), NOW(), 'active'),
('Bruce', 'Banner', 'bruce.banner@example.com', 'hulk321', '207 Gamma Blvd', 1234567007, NOW(), NOW(), 'active'),
('Barry', 'Allen', 'barry.allen@example.com', 'flash123', '208 Central City', 1234567008, NOW(), NOW(), 'active'),
('Arthur', 'Curry', 'arthur.curry@example.com', 'aquaman123', '209 Atlantis Ave', 1234567009, NOW(), NOW(), 'active');


INSERT INTO ACCOUNT (user_id, account_type, billing_address)
VALUES
(1, 'bank_account', '200 Stark Tower'),
(2, 'credit_card', '201 Wayne Manor'),
(3, 'bank_account', '202 Kent Farm'),
(4, 'credit_card', '203 Themyscira St'),
(5, 'bank_account', '204 Brooklyn Heights'),
(6, 'credit_card', '205 Red Room'),
(7, 'bank_account', '206 Queens St'),
(8, 'credit_card', '207 Gamma Blvd'),
(9, 'bank_account', '208 Central City'),
(10, 'credit_card', '209 Atlantis Ave');



INSERT INTO SELLER (seller_id, account_id)
VALUES
(1, 1),
(2, 2),
(3, 3),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10),
(4, 4);


INSERT INTO BUYER (buyer_id, account_id)
VALUES
(2, 2),
(1, 1),
(4, 4),
(5, 5),
(7, 7),
(8, 8),
(9, 9),
(3, 3),
(6, 6),
(10, 10);



INSERT INTO ADMIN (admin_id, admin_role)
VALUES
(1, 'Support Admin'),
(2, 'Compliance Admin'),
(3, 'Finance Admin'),
(4, 'Super Admin'),
(5, 'IT Admin'),
(6, 'Operations Admin'),
(7, 'Marketing Admin'),
(8, 'Security Admin'),
(9, 'Content Moderator'),
(10, 'Sales Admin');



INSERT INTO BANKACCOUNT (account_id, bank_acc_num, routing_num)
VALUES
(1, '8765432109876543', '0005432109'),
(3, '7654321098765432', '0019876543'),
(5, '6543210987654321', '0027654321'),
(7, '5432109876543210', '0031234567'),
(9, '4321098765432109', '0042345678');



INSERT INTO CREDITCARD (account_id, cc_num, exp_date)
VALUES
(2, '4111222233334444', '2027-09-19'),
(4, '5555666677778888', '2028-10-22'),
(6, '378282246444444', '2029-01-15'),
(8, '6011111111333333', '2030-02-20'),
(10, '3530111111222222', '2031-03-25');



INSERT INTO LOCATION (longitude, latitude, zip_code, address, building_image)
VALUES
('-73.935242', '40.730610', '10002', 'New York, NY', 'building1.png'),
('-118.243683', '34.052235', '90002', 'Los Angeles, CA', 'building2.png'),
('-87.623177', '41.881832', '60603', 'Chicago, IL', 'building3.png'),
('-122.419418', '37.774929', '94104', 'San Francisco, CA', 'building4.png'),
('-95.369804', '29.760427', '77002', 'Houston, TX', 'building5.png'),
('-84.387982', '33.748997', '30302', 'Atlanta, GA', 'building6.png'),
('-80.191788', '25.761681', '33102', 'Miami, FL', 'building7.png'),
('-104.990251', '39.739236', '80202', 'Denver, CO', 'building8.png'),
('-112.074036', '33.448376', '85002', 'Phoenix, AZ', 'building9.png'),
('-96.7970', '32.7767', '75202', 'Dallas, TX', 'building10.png');


INSERT INTO LISTING (seller_id, title, description, price, list_image, location_id, meta_tag, t_created, t_last_edit)
VALUES
(1, 'Iron Man Suit', 'Mark 50 Iron Man Suit replica.', 1999.99, 'ironman_suit.png', 1, 'collectibles, suit', NOW(), NOW()),
(2, 'Batmobile Model', 'Detailed Batmobile model.', 499.99, 'batmobile.png', 2, 'collectibles, car', NOW(), NOW()),
(3, 'Kryptonite Rock', 'Replica Kryptonite from Superman.', 99.99, 'kryptonite.png', 3, 'collectibles, rock', NOW(), NOW()),
(4, 'Wonder Woman Shield', 'Authentic Wonder Woman shield.', 299.99, 'shield.png', 4, 'collectibles, shield', NOW(), NOW()),
(5, 'Captain America Shield', 'Official Captain America shield.', 399.99, 'cap_shield.png', 5, 'collectibles, shield', NOW(), NOW()),
(6, 'Black Widow Suit', 'Replica Black Widow tactical suit.', 599.99, 'bw_suit.png', 6, 'collectibles, suit', NOW(), NOW()),
(7, 'Spider-Man Web Shooters', 'Functional Spider-Man web shooters.', 199.99, 'web_shooters.png', 7, 'collectibles, gadget', NOW(), NOW()),
(8, 'Hulk Smash Hands', 'Hulk smash hands toy.', 49.99, 'hulk_hands.png', 8, 'toys, action', NOW(), NOW()),
(9, 'Flash Lightning Ring', 'The Flash lightning ring replica.', 79.99, 'flash_ring.png', 9, 'collectibles, jewelry', NOW(), NOW()),
(10, 'Aquaman Trident', 'Replica of Aquamanâ€™s trident.', 999.99, 'trident.png', 10, 'collectibles, weapon', NOW(), NOW());


INSERT INTO TRANSACTION (buyer_id, seller_id, listing_id, t_date, agreed_price, serv_fee, status)
VALUES
(2, 1, 1, '2024-11-01', 1999.99, 20.00, 'completed'),
(1, 2, 2, '2024-11-02', 499.99, 15.00, 'pending'),
(4, 3, 3, '2024-11-03', 99.99, 5.00, 'confirmed'),
(5, 4, 4, '2024-11-04', 299.99, 10.00, 'completed'),
(7, 5, 5, '2024-11-05', 399.99, 12.00, 'confirming'),
(6, 6, 6, '2024-11-06', 599.99, 18.00, 'pending'),
(9, 7, 7, '2024-11-07', 199.99, 8.00, 'completed'),
(8, 8, 8, '2024-11-08', 49.99, 4.00, 'confirmed'),
(10, 9, 9, '2024-11-09', 79.99, 6.00, 'completed'),
(3, 10, 10, '2024-11-10', 999.99, 25.00, 'pending');



INSERT INTO DISPUTE (transaction_id, admin_id, description, status, resolution_date)
VALUES
(1, 1, 'Item not as described.', 'solved', '2024-11-05'),
(2, 2, 'Payment issue.', 'unsolved', NULL),
(3, 3, 'Item damaged in shipping.', 'solved', '2024-11-06'),
(4, 4, 'Delayed shipment.', 'solved', '2024-11-07'),
(5, 5, 'Item missing parts.', 'unsolved', NULL),
(6, 6, 'Unauthorized transaction.', 'solved', '2024-11-08'),
(7, 7, 'Wrong item delivered.', 'unsolved', NULL),
(8, 8, 'Request for refund.', 'solved', '2024-11-09'),
(9, 9, 'Discrepancy in price.', 'solved', '2024-11-10'),
(10, 10, 'Seller not responding.', 'unsolved', NULL);
