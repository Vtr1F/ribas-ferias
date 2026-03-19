-- Add migration script here
CREATE TABLE IF NOT EXISTS roles  (
    id SERIAL PRIMARY KEY,
    tipo TEXT UNIQUE NOT NULL --ex Sick Day, License, Vacation
);
