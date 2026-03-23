-- Add migration script here
CREATE TABLE IF NOT EXISTS roles  (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL --ex colaborador, responsavel, admin
);

INSERT INTO roles (id, name)
VALUES (1, 'admin');

INSERT INTO roles (id, name)
VALUES (2, 'leader');

INSERT INTO roles (id, name)
VALUES (3, 'worker');