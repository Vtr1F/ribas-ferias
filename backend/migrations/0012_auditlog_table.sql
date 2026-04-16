CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    request_id INTEGER REFERENCES requests(id) ON DELETE SET NULL,
    acao TEXT NOT NULL, -- Ex: 'APROVOU_FERIAS'
    detalhes JSONB, -- Podes guardar o estado antigo e o novo aqui
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);