-- Add migration script here
CREATE TABLE IF NOT EXISTS roles  (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL --ex colaborador, responsavel, admin
);