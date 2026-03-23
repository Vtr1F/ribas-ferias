-- Add migration script here
CREATE TABLE IF NOT EXISTS request_types  (
    id SERIAL PRIMARY KEY,
    tipo TEXT UNIQUE NOT NULL --ex Sick Day, License, Vacation
);

INSERT INTO request_types (tipo)
VALUES ('Sick Day');

INSERT INTO request_types (tipo)
VALUES ('License');

INSERT INTO request_types (tipo)
VALUES ('Vacation');


