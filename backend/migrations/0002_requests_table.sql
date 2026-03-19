CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    colaborador_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    superior_id INTEGER REFERENCES users(id),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    total_dias INTEGER,
    estado TEXT DEFAULT 'pendente' CHECK (estado IN ('pendente', 'completo')),
    data_submissao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);