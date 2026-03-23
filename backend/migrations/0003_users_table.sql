CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    superior_id INTEGER REFERENCES users(id), -- Auto-relacionamento
    dias_ferias_disponiveis INTEGER DEFAULT 22,
    created_at TIMESTAMP NOT NULL WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Admin User', 'admin@ribas.pt', 'hashed_password_1', 1, NULL);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Team Leader', 'leader@ribas.p', 'hashed_password_2', 2, 1);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Worker User', 'worker@ribas.pt', 'hashed_password_3', 3, 2);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Maria Santos', 'maria.santos@ribas.pt', 'hash_maria', 3, 2);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('João Pereira', 'joao.pereira@ribas.pt', 'hash_joao', 3, 2);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Ana Costa', 'ana.costa@ribas.pt', 'hash_ana', 3, 2);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Ricardo Silva', 'ricardo.silva@ribas.pt', 'hash_ricardo', 2, 1);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Beatriz Almeida', 'beatriz.almeida@ribas.pt', 'hash_beatriz', 3, 4);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Carlos Mendes', 'carlos.mendes@ribas.pt', 'hash_carlos', 3, 4);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Sofia Rocha', 'sofia.rocha@ribas.pt', 'hash_sofia', 3, 4);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Pedro Carvalho', 'pedro.carvalho@ribas.pt', 'hash_pedro', 2, 1);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Luisa Martins', 'luisa.martins@ribas.pt', 'hash_luisa', 3, 4);

INSERT INTO users (nome, email, password_hash, role_id, superior_id)
VALUES ('Hugo Fernandes', 'hugo.fernandes@ribas.pt', 'hash_hugo', 3, 4);

