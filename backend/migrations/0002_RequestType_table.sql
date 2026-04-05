-- Add migration script here
CREATE TABLE IF NOT EXISTS request_types  (
    id SERIAL PRIMARY KEY,
    type TEXT UNIQUE NOT NULL --ex Sick Day, License, Vacation
);

INSERT INTO request_types (type)
VALUES ('Sick Day');

INSERT INTO request_types (type)
VALUES ('License');

INSERT INTO request_types (type)
VALUES ('Vacation');


