CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    superior_id INTEGER REFERENCES users(id), -- Auto-relacionamento
    dias_ferias_disponiveis INTEGER DEFAULT 22,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);